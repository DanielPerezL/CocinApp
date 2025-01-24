from config import app, db, RECIPE_CART_SIZE
from flask import jsonify, request, make_response
from flask_jwt_extended import (
                                jwt_required, 
                                get_jwt, 
                                set_access_cookies, 
                                set_refresh_cookies, 
                                unset_jwt_cookies,
                                verify_jwt_in_request
                                )
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_token
import os
from utils import delete_images_by_uploader, create_tokens, hasPermission
from errors import noPermissionError, noRequestedInfoError, userNotFoundError

@app.route('/api/users', methods=['POST'])
def register():
    data = request.json
    if not data or not all(key in data for key in ('nickname', 'email', 'password')):
        return noRequestedInfoError()
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
        #return jsonify({"error": str(e.orig)}), 400


@app.route('/api/users/login', methods=['POST'])
def users_login():
    data = request.json
    if not data or not all(key in data for key in ('email', 'password')):
        return noRequestedInfoError()

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
    response = make_response(jsonify({"msg": "Inicio de sesión exitoso.", 
                                      "id": user.id,
                                      "isAdmin": user.nickname == os.environ['ADMIN_USER'],
                                      }))
    
    #En el login no necesitamos el token csrf protect
    set_access_cookies(response, access_token, max_age=app.config['JWT_ACCESS_TOKEN_EXPIRES'])
    set_refresh_cookies(response, refresh_token, max_age=app.config['JWT_REFRESH_TOKEN_EXPIRES'])
    return response, 200

@app.route('/api/users/logout', methods=['POST'])
def users_logout():
    response = jsonify({"msg": "Cierre de sesión exitoso."})
    unset_jwt_cookies(response)
    return response, 200

@app.route('/api/users/<string:id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required(optional=True)
def users_id(id):
    try:
        verify_jwt_in_request() 
        client = get_user_from_token(get_jwt())    
    except Exception as e:
        client = None
        
    # Buscar al usuario por ID
    user = User.query.get(id)
    if user is None:
        #COMPROBAR SI SE RECIBE EL NICKNAME
        user = User.query.filter_by(nickname=id).first()
        if user is None:
            return userNotFoundError()

    method = request.method
    if method == 'GET':
        if hasPermission(client, user):
            return jsonify(user.to_dto()), 200
        return jsonify(user.to_public_dto()), 200
        
    if not hasPermission(client, user):
        return noPermissionError()    
    if method == 'PUT':
        data = request.get_json()
        if data and all(key in data for key in ('current_password', 'new_password')):
            #Cambiar contraseña
            return change_password(user, data.get('current_password'), data.get('new_password'))
        #Cambiar/Borrar foto
        return new_user_picture(user, data.get("picture"))        
    if method == 'DELETE':
        return delete_account(user)

def new_user_picture(user, new_picture):
    if new_picture is None:
        return noRequestedInfoError()
    
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

def delete_account(deleting_user):
    try:
        db.session.delete(deleting_user)
        #DELETE ORPHAN ELIMINA LAS RECETAS
        db.session.commit()
        delete_images_by_uploader(deleting_user)
        return jsonify({"msg": "Usuario eliminado."}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
    return jsonify({"error": "Ha ocurrido un error inesperado. Inténtelo de nuevo más tarde."}), 400

@app.route('/api/users/<int:id>/fav_recipes', methods=['GET'])
@jwt_required()
def favorites_recipes(id):
    client = get_user_from_token(get_jwt())
    offset = request.args.get('offset', default=0, type=int)
    limit = request.args.get('limit', default=10, type=int)   
    lang = request.args.get('lang', default="", type=str)
 
    user = User.query.get(id)
    if not hasPermission(client, user):
        return jsonify({"error": "No tienes los permisos necesarios."}), 403

    recipes = [recipe.to_simple_dto(lang) for recipe in user.get_favorite_recipes(offset, limit)]
    total_favorites = user.get_favorite_recipes_count()  # Método para contar las recetas favoritas del usuario
    has_more = (offset + limit) < total_favorites

    # Devolver la respuesta con `recipes` y `has_more`
    return jsonify({"recipes": recipes, "has_more": has_more}), 200

@app.route('/api/users/<int:idU>/fav_recipes/<int:idR>', methods=['POST', 'DELETE'])
@jwt_required()
def favorites_recipes_mod(idU, idR):
    if idU < 0 or idR < 0:
        return jsonify({"error": "Al menos un id proporcionado no es válido."}), 404
    
    client = get_user_from_token(get_jwt())
    recipe = Recipe.query.get(idR)
    user = User.query.get(idU)
    if not user or not recipe:
        return jsonify({"error": "Usuario o receta no encontrados."}), 404
    if not hasPermission(client, user):
        return jsonify({"error": "No tienes permisos suficientes."}), 403
    
    method = request.method
    if method == 'POST':
        return add_favorite(user, recipe)
    if method == 'DELETE':
        return rm_favorite(user, recipe)

def add_favorite(user, recipe):
    if(user.is_favorite(recipe)):
        return jsonify({"msg": "Receta añadida a favoritos."}), 201
    try:
        favorite = FavoriteRecipe(user_id=user.id, recipe_id=recipe.id)
        db.session.add(favorite)
        db.session.commit()
        return jsonify({"msg": "Receta añadida a favoritos."}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al añadir receta favorita."}), 400
    
def rm_favorite(user, recipe): 
    favorite = FavoriteRecipe.query.filter_by(user_id=user.id, recipe_id=recipe.id).first()
    if not favorite:
        return jsonify({"msg": "Receta eliminada de favoritos."}), 200
    try:
        db.session.delete(favorite)
        db.session.commit()
        return jsonify({"msg": "Receta eliminada de favoritos."}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar receta favorita."}), 400
    

@app.route('/api/users/<int:id>/cart_recipes', methods=['GET'])
@jwt_required()
def cart_recipes(id):
    client = get_user_from_token(get_jwt())  
    user = User.query.get(id)
    if not hasPermission(client, user):
        return jsonify({"error": "No tienes los permisos necesarios."}), 403
    
    lang = request.args.get('lang', default="", type=str)
    recipes = [recipe.to_simple_dto(lang) for recipe in user.get_cart_recipes()]
    # Devolver la respuesta con `recipes` y `has_more`
    return jsonify({"recipes": recipes, "has_more": False}), 200

@app.route('/api/users/<int:idU>/cart_recipes/<int:idR>', methods=['POST', 'DELETE'])
@jwt_required()
def cart_recipes_mod(idU, idR):
    if idU < 0 or idR < 0:
        return jsonify({"error": "Al menos un id proporcionado no es válido."}), 404
    
    client = get_user_from_token(get_jwt())
    recipe = Recipe.query.get(idR)
    user = User.query.get(idU)
    if not user or not recipe:
        return jsonify({"error": "Usuario o receta no encontrados."}), 404
    if not hasPermission(client, user):
        return jsonify({"error": "No tienes permisos suficientes."}), 403
    
    method = request.method
    if method == 'POST':
        return add_cart_recipe(user, recipe)
    if method == 'DELETE':
        return rm_cart_recipe(user, recipe)

def add_cart_recipe(user, recipe):
    if(user.is_in_cart(recipe)):
        return jsonify({"msg": "Receta añadida a la cesta."}), 201
    if(user.get_cart_recipes_count() >= RECIPE_CART_SIZE):
        return jsonify({"error": "No hay más espacio disponible en la cesta."}), 400
    try:
        cartEntry = CartRecipe(user_id=user.id, recipe_id=recipe.id)
        db.session.add(cartEntry)
        db.session.commit()
        return jsonify({"msg": "Receta añadida a la cesta."}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al añadir receta a la cesta."}), 400
    
def rm_cart_recipe(user, recipe): 
    cartEntry = CartRecipe.query.filter_by(user_id=user.id, recipe_id=recipe.id).first()
    if not cartEntry:
        return jsonify({"msg": "Receta eliminada de la cesta."}), 200
    try:
        db.session.delete(cartEntry)
        db.session.commit()
        return jsonify({"msg": "Receta eliminada de la cesta."}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar receta de la cesta."}), 400
        