from config import app
from flask import jsonify, request, make_response
from flask_jwt_extended import jwt_required, get_jwt
from models import Recipe, Image
from utils import get_user_from_token
import os
from utils import has_permission, is_admin, delete_images_by_filenames
from exceptions import NotFoundException, BadRequestException, ConflictException, ForbiddenException
from services import RecipesService

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    offset = request.args.get('offset', default=0, type=int)
    limit = request.args.get('limit', default=10, type=int)
    lang = request.args.get('lang', default="", type=str)
    
    return jsonify(
        RecipesService.get_recipes_simple_dto(request, offset, limit, lang)
        ), 200
        
@app.route('/api/recipes', methods=['POST'])
@jwt_required()
def post_recipes():
    user = get_user_from_token(get_jwt())
    if user is None:
        raise NotFoundException()
    
    data = request.json

    # Verifica que se proporcione la información requerida
    if not data or not all(key in data for key in ('title', 'ingredients', 'procedure', 'images', 'time', 'difficulty', 'type')) or len(data.get('procedure')) == 0 or len(data.get('images')) == 0:
        raise BadRequestException()

    all_images_exist = True
    existing_images = []  
    for filename in data.get('images', []):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.isfile(file_path) or Image.query.filter_by(filename=filename).first() != None:
            existing_images.append(file_path)  # Guarda la ruta de las imágenes que existen
        else:
            all_images_exist = False

    # Elimina las imágenes que sí están en el servidor si alguna falta
    if not all_images_exist:
        delete_images_by_filenames(existing_images)
        raise ConflictException()


    new_recipe = RecipesService.new_recipe(user, data)
    
    response = make_response()
    response.status_code = 204
    base_url = request.host_url.rstrip('/')
    response.headers["Location"] = f"{base_url}/api/recipes/{new_recipe.id}"
    return response

@app.route('/api/recipes/<int:id>/similars', methods=['GET'])
def get_similar_recipes(id):
    recipe = Recipe.query.get(id)
    if recipe is None:
        raise NotFoundException()
    
    offset = request.args.get('offset', default=0, type=int)
    limit = request.args.get('limit', default=10, type=int)
    lang = request.args.get('lang', default="", type=str)
    return jsonify(
        RecipesService.get_recipes_similar_to(recipe, offset, limit, lang)
        ),200

@app.route('/api/recipes/categories', methods=['GET'])
def get_recipe_categories():
    return jsonify(RecipesService.get_categories()), 200

@app.route('/api/recipes/<int:id>', methods=['GET', 'DELETE', 'PATCH'])
@jwt_required(optional=True)
def recipes_id(id):
    if id < 0:
        raise NotFoundException()
    
    lang = request.args.get('lang', default="", type=str)
    client = get_user_from_token(get_jwt())    
    method = request.method
    if method == 'GET':
        recipe_dto = RecipesService.recipe_details(id, client, lang)
        return jsonify(recipe_dto), 200
    
    # Sin permisos solo podemos hacer GET
    recipe = Recipe.query.get(id)
    if not has_permission(client, recipe):
            raise ForbiddenException()
    
    if method == 'DELETE':  
        RecipesService.delete_recipe(recipe)
        return '', 204
    if method == 'PATCH':
        data = request.json
        if not data or not any(key in data for key in ('title', 'ingredients', 'procedure', 'images', 'time', 'difficulty', 'type')):
            raise BadRequestException()
        RecipesService.update_recipe(recipe, data)
        return '', 204

@app.route('/api/recipes/ingredients', methods=['GET'])
def get_ingredients():
    lang = request.args.get('lang', default="", type=str)

    ingredients_data = RecipesService.get_ingredients(lang)
    return jsonify(ingredients_data), 200
    
@app.route('/api/recipes/ingredients', methods=['POST'])
@jwt_required()
def post_ingredients():
    user = get_user_from_token(get_jwt())
    if not is_admin(user):
        raise ForbiddenException()

    # Leer el cuerpo de la solicitud
    data = request.get_json()
    if not isinstance(data, list):
        raise BadRequestException() 

    RecipesService.add_ingredients(data)
    return '', 204
    