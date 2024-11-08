from config import app, db
from flask import jsonify, request, make_response
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, set_access_cookies, set_refresh_cookies, unset_jwt_cookies
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_identity

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    #TODO: AL NO EXISTE data['...'] -> peta 500 internal server error
    if not data or not all(key in data for key in ('nickname', 'email', 'password')):
        return jsonify({"error": "Asegurate de introducir toda la información necesaria"}), 400

    if User.query.filter_by(email=data.get('email')).first() is not None:
        return jsonify({"error": "Ya exista una cuenta asociada a ese email."}), 400

    new_user = User(nickname = data.get('nickname'),
                    email = data.get('email'),
                    password = data.get('password')
                    )
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"msg": "Cuenta creada con éxito."}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Ya exista una cuenta asociada con ese nombre de usuario."}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        #COMPROBAMOS SI SE HA INTRODUCIDO EL NICKNAME QUE TMB ES UNICO
        nickname = email
        user = User.query.filter_by(nickname=nickname).first()
        if user is None or not user.check_password(password):
            return jsonify({"error": "Email o contraseña incorecto."}), 401
        

    access_token = create_access_token(identity = {"id": user.id, 
                                                   "password_hash": user.password_hash,
                                                   })
    refresh_token = create_refresh_token(identity = {"id": user.id,
                                                     "password_hash": user.password_hash,
                                                     })
    
    # Retorna los tokens en el cuerpo de la respuesta
    response = make_response(jsonify({"msg": "Inicio de sesión exitoso."}))
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response, 200

@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({"msg": "Cierre de sesión exitoso."})
    unset_jwt_cookies(response)
    return response, 200

@app.route('/api/change_password', methods=['POST'])
@jwt_required()
def change_password():
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"error": "Bad token"}), 401    
    data = request.json

    if not data or not all(key in data for key in ('current_password', 'new_password')):
        return jsonify({"error": "Asegurate de introducir toda la información necesaria"}), 400

    current_password = data.get('current_password')
    new_password = data.get('new_password')
    if not user.check_password(current_password):
        return jsonify({"error": "La contraseña actual introducida no es correcta."}), 401
    
    user.set_password(new_password)
    try:
        db.session.commit()
        return jsonify({"msg": "Contraseña actualizada con éxito."}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
    return jsonify({"error": "Ha ocurrido un error inesperado. Inténtelo de nuevo más tarde."}), 400

@app.route('/api/logged_user_profile', methods=['GET'])
@jwt_required()
def logged_user_profile():
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify(user.to_dto()), 200

@app.route('/api/user_info', methods=['GET'])
def public_user_info():
    id = request.args.get('id', default=-1, type=int)  # Default to 1 if not provided
    if id < 0:
        return jsonify({"error": "El id proporcionado no es válido."}), 404
    user = User.query.get(id)
    if user is None:
        return jsonify({"error": "Usuario no encontrado."}), 404
    return jsonify(user.to_public_dto()), 200

@app.route('/api/delete_account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"error": "Usuario no encontrado."}), 404

    try:
        db.session.delete(user)
        #DELETE ORPHAN ELIMINA LAS RECETAS
        #db.session.delete(Recipe.query.filter_by(user_id=user.id))
        db.session.commit()
        return jsonify({"msg": "Usuario eliminado."}),204
    except SQLAlchemyError as e:
        db.session.rollback()
    return jsonify({"error": "Ha ocurrido un error inesperado. Inténtelo de nuevo más tarde."}), 400

@app.route('/api/my_recipes', methods=['GET'])
@jwt_required()
def my_recipes():
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"error": "Usuario no encontrado."}), 404
    
    recipes = Recipe.query.filter_by(user_id=user.id)
    recipes_data = [recipe.to_simple_dto() for recipe in recipes]
    return jsonify(recipes_data), 200

@app.route('/api/is_fav_recipe', methods=['GET'])
@jwt_required()
def is_favorite_recipe():
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"error": "Usuario no encontrado."}), 404
    id = request.args.get('id', default=-1, type=int)  # Default to 1 if not provided
    if id < 0:
        return jsonify({"error": "El id proporcionado no es válido."}), 404
    
    is_fav = user.is_favorite(id)
    return jsonify({"is_favorite": is_fav}), 200

@app.route('/api/my_fav_recipes', methods=['GET'])
@jwt_required()
def favorites_recipes():
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"error": "Usuario no encontrado."}), 404
    
    recipes = [recipe.to_simple_dto() for recipe in user.favorite_recipes]
    recipes_data = [recipe.to_simple_dto() for recipe in recipes]
    return jsonify(recipes_data), 200

@app.route('/api/add_fav_recipe', methods=['POST'])
@jwt_required()
def add_favorite():
    id = request.args.get('id', default=-1, type=int)  # Default to 1 if not provided
    if id < 0:
        return jsonify({"error": "El id proporcionado no es válido."}), 404
    
    user = get_user_from_identity(get_jwt_identity())
    recipe = Recipe.query.get(id)

    if not user or not recipe:
        return jsonify({"error": "Usuario o receta no encontrados."}), 404

    try:
        user.add_favorite_recipe(recipe)
        db.session.commit()
        return jsonify({"msg": "Receta añadida a favoritos."}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al añadir receta favorita."}), 400
    
@app.route('/api/remove_fav_recipe', methods=['POST'])
@jwt_required()
def rm_favorite():
    id = request.args.get('id', default=-1, type=int)  # Default to 1 if not provided
    if id < 0:
        return jsonify({"error": "El id proporcionado no es válido."}), 404
    
    user = get_user_from_identity(get_jwt_identity())
    recipe = Recipe.query.get(id)

    if not user or not recipe:
        return jsonify({"error": "Usuario o receta no encontrados."}), 404

    try:
        user.remove_favorite_recipe(recipe)
        db.session.commit()
        return jsonify({"msg": "Receta eliminada de favoritos."}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar receta favorita."}), 400