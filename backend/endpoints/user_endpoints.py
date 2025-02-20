from config import app, db, NICKNAME_MAX_LENGTH, RECIPE_CART_SIZE
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
from utils import delete_images_by_uploader, create_tokens, has_permission, delete_image, has_more_results
from errors import *
import re

@app.route('/api/users', methods=['POST'])
def register():
    data = request.json
    if not data or not all(key in data for key in ('nickname', 'email', 'password')):
        return no_requested_info_error()
    nickname = data.get('nickname')
    
    if not re.match("^[a-zA-Z0-9ñÑ]*$", nickname):
        return jsonify({"msg": "El nickname solo puede contener letras, números y 'ñ'."}), 400
    
    if User.query.filter_by(email=data.get('email')).first() is not None:
        return user_already_exists_email()
    if len(nickname) > NICKNAME_MAX_LENGTH:
        return user_nick_too_long()
    
    new_user = User(nickname = nickname,
                    email = data.get('email'),
                    password = data.get('password')
                    )
    try:
        db.session.add(new_user)
        db.session.commit()
        return '', 204
    except SQLAlchemyError:
        db.session.rollback()
        return user_already_exists_nickname()


@app.route('/api/users/login', methods=['POST'])
def users_login():
    data = request.json
    if not data or not all(key in data for key in ('email', 'password')):
        return no_requested_info_error()

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
    response = make_response(jsonify({"isAdmin": user.nickname == os.environ['ADMIN_USER']}))
    
    base_url = request.host_url.rstrip('/')
    response.headers["Location"] = f"{base_url}/api/users/{user.id}"
        
    #En el login no necesitamos el token csrf protect
    set_access_cookies(response, access_token, max_age=app.config['JWT_ACCESS_TOKEN_EXPIRES'])
    set_refresh_cookies(response, refresh_token, max_age=app.config['JWT_REFRESH_TOKEN_EXPIRES'])
    return response, 200

@app.route('/api/users/logout', methods=['POST'])
def users_logout():
    response = make_response()
    unset_jwt_cookies(response)
    return response, 204

@app.route('/api/users/<string:id>', methods=['GET', 'PATCH', 'DELETE'])
@jwt_required(optional=True)
def users_id(id):
    try:
        verify_jwt_in_request() 
        client = get_user_from_token(get_jwt())    
    except Exception:
        client = None
        
    # Buscar al usuario por ID
    user = User.query.get(id)
    if user is None:
        #COMPROBAR SI SE RECIBE EL NICKNAME
        user = User.query.filter_by(nickname=id).first()
        if user is None:
            return user_not_found_error()

    method = request.method
    if method == 'GET':
        if has_permission(client, user):
            return jsonify(user.to_dto()), 200
        return jsonify(user.to_public_dto()), 200
        
    if not has_permission(client, user):
        return no_permission_error()    
    if method == 'PATCH':
        data = request.get_json()
        if data and all(key in data for key in ('current_password', 'new_password'))\
                and not any(key in data for key in ('picture',)):
            #Cambiar contraseña
            return change_password(user, data.get('current_password'), data.get('new_password'))
        if data and not any(key in data for key in ('current_password', 'new_password')):
            #Cambiar/Borrar foto
            return new_user_picture(user, data.get("picture"))  
        return no_requested_info_error()
    if method == 'DELETE':
        return delete_account(user)

def new_user_picture(user, new_picture):
    if new_picture is None:
        return no_requested_info_error()
    
    old_picture = user.get_picture()
    if old_picture:
        delete_image(old_picture)

    user.set_picture(new_picture)
    try:
        db.session.commit()
        return '', 204
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Error al publicar modificar la imagen de su perfil. Inténtelo de nuevo más tarde."}), 400
    
def change_password(user, current_password, new_password):
    if not user.check_password(current_password):
        return jsonify({"error": "La contraseña actual introducida no es correcta."}), 401
    
    user.set_password(new_password)
    try:
        db.session.commit()
        return '', 204
    except SQLAlchemyError:
        db.session.rollback()
    return unexpected_error()

def delete_account(deleting_user):
    try:
        db.session.delete(deleting_user)
        #DELETE ORPHAN ELIMINA LAS RECETAS
        db.session.commit()
        delete_images_by_uploader(deleting_user)
        return '', 204
    except SQLAlchemyError:
        db.session.rollback()
    return unexpected_error()

@app.route('/api/users/<int:id>/recipes', methods=['GET'])
def get_user_recipes(id):
    user = User.query.get(id)
    if user is None:
        return user_not_found_error()

    offset = request.args.get('offset', default=0, type=int)
    limit = request.args.get('limit', default=10, type=int)
    lang = request.args.get('lang', default="", type=str)
    return get_recipes_from_user(user, offset, limit, lang)

@app.route('/api/users/<int:id>/recommendations', methods=['GET'])
@jwt_required()
def get_user_recommendations(id):
    client = get_user_from_token(get_jwt())
    user = User.query.get(id)
    if not user:
       return user_not_found_error() 
    if not has_permission(client, user):
        return no_permission_error()

    offset = request.args.get('offset', default=0, type=int)
    limit = request.args.get('limit', default=10, type=int)
    lang = request.args.get('lang', default="", type=str)
    return get_recommendations_for_user(user, offset, limit, lang)
    
@app.route('/api/users/<int:id>/favourites', methods=['GET'])
@jwt_required()
def get_favourites(id):
    client = get_user_from_token(get_jwt())
    user = User.query.get(id)
    if not user:
       return user_not_found_error() 
    if not has_permission(client, user):
        return no_permission_error()
    
    offset = request.args.get('offset', default=0, type=int)
    limit = request.args.get('limit', default=10, type=int)
    lang = request.args.get('lang', default="", type=str)
    return get_favorites_recipes(user, offset, limit, lang)

@app.route('/api/users/<int:idU>/favourites/<int:idR>', methods=['POST', 'DELETE'])
@jwt_required()
def favorites_recipes_mod(idU, idR):
    if idU < 0 or idR < 0:
        return no_valid_id_provided()
    
    client = get_user_from_token(get_jwt())
    recipe = Recipe.query.get(idR)
    user = User.query.get(idU)
    if not user:
       return user_not_found_error() 
    if not recipe:
        return recipe_not_found_error()
    if not has_permission(client, user):
        return no_permission_error()
    
    method = request.method
    if method == 'POST':
        return add_favorite(user, recipe)
    if method == 'DELETE':
        return rm_favorite(user, recipe)

def add_favorite(user, recipe):
    if(user.is_favorite(recipe)):
        return '', 204
    try:
        favorite = FavoriteRecipe(user_id=user.id, recipe_id=recipe.id)
        db.session.add(favorite)
        db.session.commit()
        return '', 204
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Error al añadir receta favorita."}), 400
    
def rm_favorite(user, recipe): 
    favorite = FavoriteRecipe.query.filter_by(user_id=user.id, recipe_id=recipe.id).first()
    if not favorite:
        return '', 204
    try:
        db.session.delete(favorite)
        db.session.commit()
        return '', 204
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar receta favorita."}), 400
    
@app.route('/api/users/<int:id>/cart', methods=['GET'])
@jwt_required()
def get_cart(id):
    client = get_user_from_token(get_jwt())
    user = User.query.get(id)
    if not user:
       return user_not_found_error() 
    if not has_permission(client, user):
        return no_permission_error()
    
    lang = request.args.get('lang', default="", type=str)
    return get_cart_recipes(user, lang)

@app.route('/api/users/<int:idU>/cart/<int:idR>', methods=['POST', 'DELETE'])
@jwt_required()
def cart_recipes_mod(idU, idR):
    if idU < 0 or idR < 0:
        return no_valid_id_provided()
    
    client = get_user_from_token(get_jwt())
    recipe = Recipe.query.get(idR)
    user = User.query.get(idU)
    if not user:
        return user_not_found_error()
    if not recipe:
        return recipe_not_found_error()
    if not has_permission(client, user):
        return no_permission_error()
    
    method = request.method
    if method == 'POST':
        return add_cart_recipe(user, recipe)
    if method == 'DELETE':
        return rm_cart_recipe(user, recipe)

def add_cart_recipe(user, recipe):
    if(user.is_in_cart(recipe)):
        return '', 204
    if(user.get_cart_recipes_count() >= RECIPE_CART_SIZE):
        return jsonify({"error": "No hay más espacio disponible en la cesta."}), 409
    try:
        cartEntry = CartRecipe(user_id=user.id, recipe_id=recipe.id)
        db.session.add(cartEntry)
        db.session.commit()
        return '', 204
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Error al añadir receta a la cesta."}), 400
    
def rm_cart_recipe(user, recipe): 
    cartEntry = CartRecipe.query.filter_by(user_id=user.id, recipe_id=recipe.id).first()
    if not cartEntry:
        return '', 204
    try:
        db.session.delete(cartEntry)
        db.session.commit()
        return '', 204
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar receta de la cesta."}), 400
        

# GRID 3
def get_recommendations_for_user(user, offset, limit, lang):
    # Obtenemos los IDs de las recetas favoritas del usuario
    user_favorite_recipe_ids = db.session.query(FavoriteRecipe.recipe_id).filter_by(user_id=user.id).all()
    user_favorite_recipe_ids = [id[0] for id in user_favorite_recipe_ids]  # Extraer los IDs de la tupla

    # Obtener usuarios que han marcado como favorita al menos una receta en común con el usuario
    similar_users = User.query \
        .join(FavoriteRecipe, User.id == FavoriteRecipe.user_id) \
        .filter(FavoriteRecipe.recipe_id.in_(user_favorite_recipe_ids)) \
        .filter(User.id != user.id) \
        .distinct().all()

    # Si no hay usuarios similares, no podemos obtener recomendaciones
    if not similar_users:
        return jsonify({"recipes": [], "has_more": False}), 200

    # Obtener las recetas favoritas de los usuarios similares
    similar_recipe_ids = db.session.query(FavoriteRecipe.recipe_id) \
        .filter(FavoriteRecipe.user_id.in_([similar_user.id for similar_user in similar_users])) \
        .all()
    # Extraer los IDs de las recetas
    similar_recipe_ids = [id[0] for id in similar_recipe_ids]
    
    #Excluir las ya favoritas
    query = Recipe.query \
        .filter(Recipe.id.in_(similar_recipe_ids)) \
        .filter(Recipe.id.notin_(user_favorite_recipe_ids)) \
        .order_by(Recipe.favorites_count.desc(), Recipe.id.asc())

    recommended_recipes = query.offset(offset).limit(limit).all()
    recommended_recipes_data = [recipe.to_simple_dto(lang) for recipe in recommended_recipes]

    has_more = has_more_results(query, offset, limit)
    # Devolver las recetas recomendadas como DTO
    return jsonify({"recipes": recommended_recipes_data, 
                    "has_more": has_more},
                    ), 200

# GRID 4
def get_recipes_from_user(user, offset, limit, lang):
    query = Recipe.query.filter_by(user_id=user.id)
    recipes = query.offset(offset).limit(limit).all()
    recipes_data = [recipe.to_simple_dto(lang) for recipe in recipes]
    has_more = has_more_results(query, offset, limit)
    return jsonify({"recipes": recipes_data, "has_more": has_more}), 200

# GRID 5
def get_favorites_recipes(user, offset, limit, lang):
    recipes = [recipe.to_simple_dto(lang) for recipe in user.get_favorite_recipes(offset, limit)]
    total_favorites = user.get_favorite_recipes_count()  # Método para contar las recetas favoritas del usuario
    has_more = (offset + limit) < total_favorites

    # Devolver la respuesta con `recipes` y `has_more`
    return jsonify({"recipes": recipes, "has_more": has_more}), 200

# GRID 6
def get_cart_recipes(user, lang):    
    # No usamos limit/offset porque el carrito se limita a RECIPE_CART_SIZE recetas
    recipes = [recipe.to_simple_dto(lang) for recipe in user.get_cart_recipes()]
    return jsonify({"recipes": recipes, "has_more": False}), 200
