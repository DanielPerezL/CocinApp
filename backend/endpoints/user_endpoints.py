from config import app, db
from flask import jsonify, request, make_response
from flask_jwt_extended import (
                                jwt_required, 
                                get_jwt, 
                                set_access_cookies, 
                                set_refresh_cookies, 
                                unset_jwt_cookies,
                                )
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_token
import os
from utils import delete_images_by_uploader, create_tokens

@app.route('/api/users', methods=['POST'])
def register():
    data = request.json
    if not data or not all(key in data for key in ('nickname', 'email', 'password')):
        return jsonify({"error": "Asegurate de introducir toda la información necesaria"}), 400

    if User.query.filter_by(email=data.get('email')).first() is not None:
        return jsonify({"error": "Ya existe una cuenta asociada a ese email."}), 400

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
        return jsonify({"error": "Ya existe una cuenta asociada con ese nombre de usuario."}), 400

@app.route('/api/users/login', methods=['POST'])
def users_login():
    data = request.json
    if not data or not all(key in data for key in ('email', 'password')):
        return jsonify({"error": "Asegurate de introducir toda la información necesaria."}), 400

    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user is None:
        #COMPROBAMOS SI SE HA INTRODUCIDO EL NICKNAME QUE TAMBIEN ES UNICO
        nickname = email
        user = User.query.filter_by(nickname=nickname).first()
        if user is None:
            return jsonify({"error": "No existe ningún usuario con ese nombre o email."}), 400

    if not user.check_password(password):
        return jsonify({"error": "La contraseña introducida no es correcta."}), 401
        
    access_token, refresh_token = create_tokens(user)

    # Retorna los tokens en el cuerpo de la respuesta
    response = make_response(jsonify({"msg": "Inicio de sesión exitoso.", "id": user.id}))
    
    #En el login no necesitamos el token csrf protect
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response, 200

@app.route('/api/users/logout', methods=['POST'])
@jwt_required()
def users_logout():
    response = jsonify({"msg": "Cierre de sesión exitoso."})
    unset_jwt_cookies(response)
    return response, 200

@app.route('/api/users/<string:id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required(optional=True)
def users_id(id):
    method = request.method
    if method == 'GET':
        return user_info(get_jwt(), id)
    if method == 'PUT':
        id = (int)(id)
        user = get_user_from_token(get_jwt())    
        if user is None:
            return jsonify({"error": "Usuario no encontrado."}), 404
        if user.id != id:
            return jsonify({"error": "No tienes los permisos necesarios."}), 403
        
        data = request.json
        if data and all(key in data for key in ('current_password', 'new_password')):
            #Cambiar contraseña
            return change_password(user, data.get('current_password'), data.get('new_password'))
        #Cambiar/Borrar foto
        return new_user_picture(user, data.get("picture") or "")
                
    if method == 'DELETE':
        return delete_account(get_jwt())

def user_info(jwt_token, id):
    # Buscar al usuario por ID
    user = User.query.get(id)
    if user is None:
        #COMPROBAR SI SE RECIBE EL NICKNAME
        user = User.query.filter_by(nickname=id).first()
        if user is None:
            return jsonify({"error": "Usuario no encontrado."}), 404

    client = get_user_from_token(jwt_token)
    if client is None or client.id != user.id:
        return jsonify(user.to_public_dto()), 200
    return jsonify(user.to_dto()), 200

def new_user_picture(user, new_picture):
    new_path = os.path.join(app.config['UPLOAD_FOLDER'], new_picture)
    old_picture = user.get_picture() or ""
    old_path = os.path.join(app.config['UPLOAD_FOLDER'], old_picture)
    if os.path.isfile(old_path):
        os.remove(old_path)
        
    user.set_picture(new_picture)
    try:
        db.session.commit()
        return jsonify({"msg": "Imagen de perfil actualizada correctamente."}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al publicar modificar la imagen de su perfil. Inténtelo de nuevo más tarde."}), 400
    
def change_password(user, current_password, new_password):
    if not user.check_password(current_password):
        return jsonify({"error": "La contraseña actual introducida no es correcta."}), 401
    
    user.set_password(new_password)
    try:
        db.session.commit()
        return jsonify({"msg": "Contraseña actualizada con éxito."}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
    return jsonify({"error": "Ha ocurrido un error inesperado. Inténtelo de nuevo más tarde."}), 400

def delete_account(jwt_token):
    user = get_user_from_token(jwt_token)
    if user is None:
        return jsonify({"error": "Usuario no encontrado."}), 404
    try:
        db.session.delete(user)
        #DELETE ORPHAN ELIMINA LAS RECETAS
        db.session.commit()
        delete_images_by_uploader(user)
        return jsonify({"msg": "Usuario eliminado."}),204
    except SQLAlchemyError as e:
        db.session.rollback()
    return jsonify({"error": "Ha ocurrido un error inesperado. Inténtelo de nuevo más tarde."}), 400

@app.route('/api/users/<int:id>/fav_recipes', methods=['GET'])
@jwt_required()
def favorites_recipes(id):
    user = get_user_from_token(get_jwt())
    if user is None:
        return jsonify({"error": "Usuario no encontrado."}), 404
    
    if user.id != id:
        return jsonify({"error": "No tienes los permisos necesarios."}), 403

    recipes = [recipe.to_simple_dto() for recipe in user.get_favorite_recipes()]
    return jsonify(recipes), 200

@app.route('/api/users/<int:idU>/fav_recipes/<int:idR>', methods=['POST', 'DELETE'])
@jwt_required()
def favorites_recipes_mod(idU, idR):
    if idU < 0 or idR < 0:
        return jsonify({"error": "Al menos un id proporcionado no es válido."}), 404
    
    user = get_user_from_token(get_jwt())
    recipe = Recipe.query.get(idR)
    if not user or not recipe:
        return jsonify({"error": "Usuario o receta no encontrados."}), 404
    if user.id != idU:
        return jsonify({"error": "No tienes permisos suficientes."}), 403
    
    method = request.method
    if method == 'POST':
        return add_favorite(user, recipe)
    if method == 'DELETE':
        return rm_favorite(user, recipe)

def add_favorite(user, recipe):
    try:
        user.add_favorite_recipe(recipe)
        #EL COMMIT SE HACE EN LA FUNCION db.session.commit()
        return jsonify({"msg": "Receta añadida a favoritos."}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al añadir receta favorita."}), 400
    
def rm_favorite(user, recipe): 
    try:
        user.remove_favorite_recipe(recipe)
        #EL COMMIT SE HACE EN LA FUNCION db.session.commit()
        return jsonify({"msg": "Receta eliminada de favoritos."}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar receta favorita."}), 400
    