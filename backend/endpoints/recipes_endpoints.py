from config import app, db
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, verify_jwt_in_request
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_token
import os
from utils import delete_images_by_filenames, hasPermission, isAdmin
from errors import *

@app.route('/api/recipes', methods=['GET', 'POST'])
#@jwt_required(optional=True)
def recipes():
    method = request.method
    if method == 'GET':
        user_id = request.args.get('user_id', default=-1, type=int)
        recipe_id = request.args.get('recipe_id', default=-1, type=int)
        recommendations_for_user_id = request.args.get('recommendations_for_user_id', default=-1, type=int)

        offset = request.args.get('offset', default=0, type=int)
        limit = request.args.get('limit', default=10, type=int)
        
        if user_id > 0:
            user = User.query.get(user_id)
            if user is None:
                return userNotFoundError()
            return get_recipes_from_user(user, offset, limit)
        elif recipe_id > 0:
            recipe = Recipe.query.get(recipe_id)
            if recipe is None:
                return recipeNotFoundError()
            return get_recipes_similar_to(recipe, offset, limit)
        elif recommendations_for_user_id > 0:
            user = User.query.get(recommendations_for_user_id)
            if user is None:
                return userNotFoundError()
            return get_recommendations_for_user(user, offset, limit)
        else:
            return get_recipes_simple_dto(offset, limit) 
    if method == 'POST':
        try:
            verify_jwt_in_request() 
        except Exception as e:
            return jsonify({"error": "Authentication required or invalid token"}), 401

        user = get_user_from_token(get_jwt())
        if user is None:
            return userNotFoundError()
        return new_recipe(user, request.json)

def has_more_results(query, offset, limit):
    return query.offset(offset + limit).first() is not None

#GRID 1
def get_recipes_simple_dto(offset, limit):
    query = Recipe.query.order_by(Recipe.favorites_count.desc(), Recipe.id.asc())
    recipes = query.offset(offset).limit(limit).all()
    recipes_data = [recipe.to_simple_dto() for recipe in recipes]
    has_more = has_more_results(query, offset, limit)
    return jsonify({"recipes": recipes_data, 
                    "has_more": has_more},
                    ), 200


#GRID 2
def get_recommendations_for_user(user, offset, limit):
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
    recommended_recipes_data = [recipe.to_simple_dto() for recipe in recommended_recipes]

    has_more = has_more_results(query, offset, limit)
    # Devolver las recetas recomendadas como DTO
    return jsonify({"recipes": recommended_recipes_data, 
                    "has_more": has_more},
                    ), 200

#GRID 3
def get_recipes_similar_to(recipe, offset, limit):
    query = Recipe.query.order_by(Recipe.favorites_count.desc(), Recipe.id.asc()) \
        .filter((Recipe.time == recipe.time) | (Recipe.difficulty == recipe.difficulty)) \
        .filter(Recipe.id != recipe.id) \
        .filter(Recipe.type == recipe.type if recipe.type != "others" else Recipe.type.isnot(None))

    similar_recipes = query.offset(offset).limit(limit).all()
    recipes_data = [recipe.to_simple_dto() for recipe in similar_recipes]
    has_more = has_more_results(query, offset, limit)
    return jsonify({"recipes": recipes_data, "has_more": has_more}), 200


#GRID 4
def get_recipes_from_user(user, offset, limit):
    query = Recipe.query.filter_by(user_id=user.id)
    recipes = query.offset(offset).limit(limit).all()
    recipes_data = [recipe.to_simple_dto() for recipe in recipes]
    has_more = has_more_results(query, offset, limit)
    return jsonify({"recipes": recipes_data, "has_more": has_more}), 200


def new_recipe(user, data):
    # Verifica que se proporcione la información requerida
    if not data or not all(key in data for key in ('title', 'ingredients', 'procedure', 'images', 'time', 'difficulty', 'type')) or len(data.get('procedure')) == 0 or len(data.get('images')) == 0:
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

    # Procesar los ingredientes: se espera que `data['ingredients']` sea un dict {id: cantidad}
    ingredients_data = data.get('ingredients', [])
    concrete_ingredients = []

    # Crear la receta
    new_recipe = Recipe(
        title=data.get('title'),
        user_id=user.id,
        procedure=data.get('procedure'),
        images=data.get('images'),
        time=data.get('time'),
        difficulty=data.get('difficulty'),
        type=data.get('type')
    )

    try:
        # Agregar la receta a la base de datos
        db.session.add(new_recipe)
        db.session.flush()  # Para obtener el ID de la receta antes de hacer commit

        # Crear los ingredientes concretos
        for ingredient_data in ingredients_data:
            ingredient_id = ingredient_data.get('id')
            amount = ingredient_data.get('amount')

            if ingredient_id is None or amount is None:
                continue  # Salta si algún dato está incompleto

            # Crear la entrada en ConcreteIngredient con recipe_id ya asignado
            concrete_ingredient = ConcreteIngredient(
                ingredient_id=ingredient_id,
                amount=amount,
                recipe_id=new_recipe.id  # Asignar el id de la receta recién creada
            )

            concrete_ingredients.append(concrete_ingredient)

        # Guardar los ingredientes concretos en la base de datos
        db.session.add_all(concrete_ingredients)

        # Realizar un único commit para todas las operaciones
        db.session.commit()
        return jsonify({"msg": "Receta publicada con éxito", "new_id": new_recipe.id}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return noRecipeUploadedError()


@app.route('/api/recipe/categories', methods=['GET'])
def get_recipe_categories():
    time_options = Recipe.get_time_options()  # Obtener los valores posibles de 'tiempo'
    difficulty_options = Recipe.get_difficulty_options()  # Obtener los valores posibles de 'dificultad'
    type_options = Recipe.get_type_options()  # Obtener los valores posibles de 'tipo'
    
    return jsonify({"name":"time", "options": time_options}, 
                    {"name":"difficulty", "options": difficulty_options},
                    {"name":"type", "options": type_options}), 200

@app.route('/api/recipes/<int:id>', methods=['GET', 'DELETE'])
@jwt_required(optional=True)
def recipes_id(id):
    if id < 0:
        return noValidIdProvided()
    
    lang = request.args.get('lang', default="", type=str)

    #AQUI MANTENGO EL OPTIONAL PORQUE SI NO HAY TOKEN
    # CLIENT=None
    #SI HAY TOKEN DEBE SER VALIDO
    client = get_user_from_token(get_jwt())    
    method = request.method
    if method == 'GET':
        return recipe_details(id, client, lang)
    if method == 'DELETE':
        recipe = Recipe.query.get(id)
        if not hasPermission(client, recipe):
            return noPermissionError()
        return delete_recipe(recipe)

def recipe_details(id, client, lang):
    recipe = Recipe.query.get(id)
    if recipe is None:
        return recipeNotFoundError()
    recipe_dto = recipe.to_details_dto(lang)
    recipe_dto["isFav"] = client.is_favorite(recipe) if client else False
    return jsonify(recipe_dto), 200

def delete_recipe(recipe):
    filenames = recipe.images
    try:
        db.session.delete(recipe)
        db.session.commit()
        delete_images_by_filenames(filenames)
        return jsonify({"msg": "Receta eliminada correctamente"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
    return unexpectedError()

@app.route('/api/recipe/ingredients', methods=['GET', 'POST'])
def ingredients():
    lang = request.args.get('lang', default="", type=str)
    if request.method == 'GET':
        # Obtener todos los ingredientes disponibles
        ingredients = Ingredient.query.all()
        ingredients_data = [ingredient.to_dto(lang) for ingredient in ingredients]
        return jsonify(ingredients_data), 200

    elif request.method == 'POST':
        try:
            verify_jwt_in_request() 
        except Exception as e:
            return jsonify({"error": "Authentication required or invalid token"}), 401
        user = get_user_from_token(get_jwt())
        if not isAdmin(user):
            return noPermissionError()

        try:
            # Leer el cuerpo de la solicitud
            data = request.get_json()
            if not isinstance(data, list):
                return jsonify({"error": "El cuerpo de la solicitud debe ser una lista de ingredientes"}), 400

            errores = []
            for ingredient_data in data:
                # Validar los campos obligatorios
                if not all(key in ingredient_data for key in ["name_en","name_es", "default_unit"]):
                    errores.append(f"Faltan campos en el ingrediente: {ingredient_data}")
                    continue

                # Verificar si el ingrediente ya existe
                existing_ingredient = Ingredient.query.filter_by(
                    name_es=ingredient_data["name_es"],
                    name_en=ingredient_data["name_en"],
                    default_unit=ingredient_data["default_unit"]
                ).first()

                if existing_ingredient:
                    errores.append(f"Ingrediente ya existente: {ingredient_data}")
                    continue

                # Crear el nuevo ingrediente
                new_ingredient = Ingredient(
                    name_es=ingredient_data["name_es"],
                    name_en=ingredient_data["name_en"],
                    default_unit=ingredient_data["default_unit"]
                )
                db.session.add(new_ingredient)

            # Guardar los cambios
            db.session.commit()

            if len(errores) < len(data):
                return jsonify({"message": "Algunos ingredientes se agregaron con éxito, pero hubo errores.", "errors": errores}), 207
            elif len(errores) == len(data):
                return jsonify({"message": "Todos los ingredientes enviados ya estaban agregados."}), 202
            return jsonify({"message": "Todos los ingredientes se agregaron con éxito."}), 201

        except Exception as e:
            db.session.rollback()  # Deshacer los cambios en caso de error
            return jsonify({"error": f"Error al procesar la solicitud: {str(e)}"}), 500