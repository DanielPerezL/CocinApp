from config import app, db
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_token
import os
from utils import delete_images_by_filenames, hasPermission
from errors import *

@app.route('/api/recipes', methods=['GET', 'POST'])
@jwt_required(optional=True)
def recipes():
    method = request.method
    if method == 'GET':
        user_id = request.args.get('user_id', default=-1, type=int)
        if user_id < 0:
            return get_recipes_simple_dto() 
        user = User.query.get(user_id)
        if user is None:
            return userNotFoundError()
        return get_recipes_from_user(user)
    if method == 'POST':
        user = get_user_from_token(get_jwt())
        if user is None:
            return userNotFoundError()
        return new_recipe(user, request.json)

@app.route('/api/recipe/categories', methods=['GET'])
def get_recipe_categories():
    time_options = Recipe.get_time_options()  # Obtener los valores posibles de 'tiempo'
    difficulty_options = Recipe.get_difficulty_options()  # Obtener los valores posibles de 'dificultad'
    return jsonify({"name":"time", "options": time_options}, 
                    {"name":"difficulty", "options": difficulty_options}), 200

def get_recipes_simple_dto():
    recipes = Recipe.query.all()
    recipes_data = [recipe.to_simple_dto() for recipe in recipes]
    return jsonify(recipes_data), 200

def get_recipes_from_user(user):
    recipes = Recipe.query.filter_by(user_id=user.id).all()
    recipes_data = [recipe.to_simple_dto() for recipe in recipes]
    return jsonify(recipes_data), 200

def new_recipe(user, data):
    # Verifica que se proporcione la información requerida
    if not data or not all(key in data for key in ('title', 'ingredients', 'procedure', 'images', 'time', 'difficulty')) or len(data.get('procedure')) == 0 or len(data.get('images')) == 0:
        return noRequestedInfoError()

    all_images_exist = True
    existing_images = []  
    for filename in data.get('images', []):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.isfile(file_path):
            existing_images.append(file_path)  # Guarda la ruta de las imágenes que existen
        else:
            all_images_exist = False
    # Elimina las imágenes que sí están en el servidor si alguna falta
    if not all_images_exist:
        for file_path in existing_images:
            os.remove(file_path)
        return noRecipeUploadedError()
    
    # Crea una nueva receta
    new_recipe = Recipe(
        title=data.get('title'),
        user_id=user.id,
        ingredients=data.get('ingredients'),
        procedure=data.get('procedure'),
        images=data.get('images'),
        time=data.get('time'),
        difficulty=data.get('difficulty')
    )
    try:
        db.session.add(new_recipe)
        db.session.commit()
        return jsonify({"msg": "Receta publica con éxito", "new_id": new_recipe.id}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return noRecipeUploadedError()

@app.route('/api/recipes/<int:id>', methods=['GET', 'DELETE'])
@jwt_required(optional=True)
def recipes_id(id):
    if id < 0:
        return noValidIdProvided()
    method = request.method

    if method == 'GET':
        return recipe_details(id)
    if method == 'DELETE':
        client = get_user_from_token(get_jwt())
        recipe = Recipe.query.get(id)
        if not hasPermission(client, recipe):
            return noPermissionError()
        return delete_recipe(recipe)

def recipe_details(id):
    recipe = Recipe.query.get(id)
    if recipe is None:
        return recipeNotFoundError()
    return jsonify(recipe.to_details_dto()), 200

def delete_recipe(recipe):
    filenames = recipe.images
    try:
        db.session.delete(recipe)
        db.session.commit()
        delete_images_by_filenames(filenames)
        return jsonify({"msg": "Receta eliminada correctamente"}), 204
    except SQLAlchemyError as e:
        db.session.rollback()
    return unexpectedError()