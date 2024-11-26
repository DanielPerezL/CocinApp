from config import app, db
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_token
import os
from utils import delete_images_by_filenames

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
            return jsonify({"error": "Usuario no encontrado."}), 404
        return get_recipes_from_user(user)
    if method == 'POST':
        user = get_user_from_token(get_jwt())
        if user is None:
            return jsonify({"error": "Usuario no encontrado"}), 404
        return new_recipe(user, request.json)

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
    if not data or not all(key in data for key in ('title', 'ingredients', 'procedure', 'images')):
        return jsonify({"error": "Asegurate de rellenar toda la información necesaria (titulo, ingredientes, procedimiento, imagen(es))"}), 400

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
        return jsonify({"error": "Error al publicar la receta. Inténtelo de nuevo más tarde."}), 400

    # Crea una nueva receta
    new_recipe = Recipe(
        title=data.get('title'),
        user_id=user.id,
        ingredients=data.get('ingredients'),
        procedure=data.get('procedure'),
        images=','.join(data.get('images'))  # Convierte la lista de imágenes a una cadena separada por comas
    )
    try:
        db.session.add(new_recipe)
        db.session.commit()
        return jsonify({"msg": "Receta publica con éxito", "new_id": new_recipe.id}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al publicar la receta. Inténtelo de nuevo más tarde."}), 400

@app.route('/api/recipes/<int:id>', methods=['GET', 'DELETE'])
@jwt_required(optional=True)
def recipes_id(id):
    if id < 0:
        return jsonify({"error": "El id proporcionado no es válido"}), 404
    
    method = request.method
    if method == 'GET':
        return recipe_details(id)
    if method == 'DELETE':
        user = get_user_from_token(get_jwt())
        if user is None:
            return jsonify({"error": "Usuario no encontrado"}), 404
        data = request.json
        recipe = Recipe.query.get(data.get('recipe_id'))
        if recipe is None:
            return jsonify({"error": "Receta no encontrada"}), 404
        if recipe.user_id != user.id:
            return jsonify({"error": "No tienes los permisos necesarios."}), 403
        return delete_recipe(recipe)

def recipe_details(id):
    recipe = Recipe.query.get(id)
    if recipe is None:
        return jsonify({"error": "Receta no encontrada"}), 404
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
    return jsonify({"error": "Ha ocurrido un error inesperado. Inténtelo de nuevo más tarde."}), 400