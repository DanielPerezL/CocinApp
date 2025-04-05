from config import app, db, NICKNAME_MAX_LENGTH, RECIPE_CART_SIZE
from flask import jsonify, request
from flask_jwt_extended import (
                                jwt_required, 
                                get_jwt, 
                                verify_jwt_in_request
                                )
from models import *
from utils import get_user_from_token
from utils import delete_images_by_uploader, has_permission, delete_image, has_more_results
from exceptions import *
from services import UsersService, RecipesService

@app.route('/api/users', methods=['POST'])
def register():
    data = request.json
    if not data or not all(key in data for key in ('nickname', 'email', 'password')):
            raise BadRequestException()
    
    UsersService.add_user(nickname=data.get('nickname'), 
                          email=data.get('email'),
                          password=data.get('password'),
                          )
    return '', 204

@app.route('/api/users/<string:id>', methods=['GET', 'PATCH', 'DELETE'])
@jwt_required(optional=True)
def users_id(id):
    try:
        verify_jwt_in_request() 
        client = get_user_from_token(get_jwt())    
    except Exception:
        client = None
        
    # Buscar al usuario por ID
    user = UsersService.get_user(id)

    method = request.method
    if method == 'GET':
        if has_permission(client, user):
            return jsonify(user.to_dto()), 200
        return jsonify(user.to_public_dto()), 200
        
    # Sin permisos solo se puede hacer el GET
    if not has_permission(client, user):
        raise ForbiddenException()    
    
    if method == 'PATCH':
        UsersService.update_user(user, request.get_json())
        return '', 204
       
    if method == 'DELETE':
        UsersService.delete_account(user)
        return '', 204

@app.route('/api/users/<int:id>/recipes', methods=['GET'])
def get_user_recipes(id):
    user = User.query.get(id)
    if user is None:
        raise NotFoundException()

    offset = request.args.get('offset', default=0, type=int)
    limit = request.args.get('limit', default=10, type=int)
    lang = request.args.get('lang', default="", type=str)
    return jsonify(
        RecipesService.get_recipes_from_user(user, offset, limit, lang)
        ),200

@app.route('/api/users/<int:id>/recommendations', methods=['GET'])
@jwt_required()
def get_user_recommendations(id):
    client = get_user_from_token(get_jwt())
    user = User.query.get(id)
    if not user:
       raise NotFoundException()
    if not has_permission(client, user):
        raise ForbiddenException()

    offset = request.args.get('offset', default=0, type=int)
    limit = request.args.get('limit', default=10, type=int)
    lang = request.args.get('lang', default="", type=str)
    return jsonify(
        RecipesService.get_recommendations_for_user(user, offset, limit, lang)
        ),200
    
@app.route('/api/users/<int:id>/favourites', methods=['GET'])
@jwt_required()
def get_favourites(id):
    client = get_user_from_token(get_jwt())
    user = User.query.get(id)
    if not user:
       raise NotFoundException()
    if not has_permission(client, user):
        raise ForbiddenException()
    
    offset = request.args.get('offset', default=0, type=int)
    limit = request.args.get('limit', default=10, type=int)
    lang = request.args.get('lang', default="", type=str)
    return jsonify(
        RecipesService.get_favorites_recipes(user, offset, limit, lang)
        ),200

@app.route('/api/users/<int:idU>/favourites/<int:idR>', methods=['POST', 'DELETE'])
@jwt_required()
def favorites_recipes_mod(idU, idR):
    if idU < 0 or idR < 0:
        raise NotFoundException()
    
    client = get_user_from_token(get_jwt())
    recipe = Recipe.query.get(idR)
    user = User.query.get(idU)
    if not user or not recipe:
        raise NotFoundException()
    if not has_permission(client, user):
        raise ForbiddenException()
    
    method = request.method
    if method == 'POST':
        UsersService.add_favorite(user, recipe)
    if method == 'DELETE':
        UsersService.rm_favorite(user, recipe)
    return '', 204

        
@app.route('/api/users/<int:id>/cart', methods=['GET'])
@jwt_required()
def get_cart(id):
    client = get_user_from_token(get_jwt())
    user = User.query.get(id)
    if not user:
       raise NotFoundException() 
    if not has_permission(client, user):
        raise ForbiddenException()

    
    lang = request.args.get('lang', default="", type=str)
    return jsonify(
        RecipesService.get_cart_recipes(user, lang)
        ),200

@app.route('/api/users/<int:idU>/cart/<int:idR>', methods=['POST', 'DELETE'])
@jwt_required()
def cart_recipes_mod(idU, idR):
    if idU < 0 or idR < 0:
        raise NotFoundException()
    
    client = get_user_from_token(get_jwt())
    recipe = Recipe.query.get(idR)
    user = User.query.get(idU)
    if not user or not recipe:
        raise NotFoundException()
    if not has_permission(client, user):
        raise ForbiddenException()
    
    method = request.method
    if method == 'POST':
        UsersService.add_cart_recipe(user, recipe)
    if method == 'DELETE':
        UsersService.rm_cart_recipe(user, recipe)

    return '', 204
