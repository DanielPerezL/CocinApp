from config import app, db
from flask import jsonify, request, make_response
from flask_jwt_extended import jwt_required, get_jwt, verify_jwt_in_request
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_token, has_more_results
import os
from utils import delete_images_by_filenames, has_permission, is_admin
from errors import *

@app.route('/api/recipes', methods=['GET', 'POST'])
#@jwt_required(optional=True)
def recipes():
    method = request.method
    if method == 'GET':
        offset = request.args.get('offset', default=0, type=int)
        limit = request.args.get('limit', default=10, type=int)
        lang = request.args.get('lang', default="", type=str)
        
        return get_recipes_simple_dto(offset, limit, lang) 
    if method == 'POST':
        try:
            verify_jwt_in_request() 
        except Exception:
            return invalid_token()
        
        user = get_user_from_token(get_jwt())
        if user is None:
            return user_not_found_error()
        return new_recipe(user, request.json)
    
@app.route('/api/recipes/<int:id>/similars', methods=['GET'])
def get_similar_recipes(id):
    recipe = Recipe.query.get(id)
    if recipe is None:
        return recipe_not_found_error()
    
    offset = request.args.get('offset', default=0, type=int)
    limit = request.args.get('limit', default=10, type=int)
    lang = request.args.get('lang', default="", type=str)
    return get_recipes_similar_to(recipe, offset, limit, lang)
       
# GRID 1
def get_recipes_simple_dto(offset, limit, lang):
    # PARAMETROS DE BUSQUEDA
    title = request.args.get('title', default="", type=str)  
    min_steps = request.args.get('min_steps', default=0, type=int)
    max_steps = request.args.get('max_steps', default=None, type=int)
    time_list = request.args.getlist('time', type=str)  # Lista de tiempos
    difficulty_list = request.args.getlist('difficulty', type=str)  # Lista de dificultades
    type = request.args.get('type', default=None, type=str)  
    contains_ingredients = request.args.getlist('c_i', type=int)
    excludes_ingredients = request.args.getlist('e_i', type=int)

    query = Recipe.query

    # Filtros de búsqueda
    if title:
        query = query.filter(Recipe.title.ilike(f"%{title}%"))
    if min_steps > 0:
        query = query.filter(db.func.json_length(Recipe.procedure) >= min_steps)
    if max_steps is not None:
        query = query.filter(db.func.json_length(Recipe.procedure) <= max_steps)
    if time_list:  # Si hay valores en la lista de tiempos
        query = query.filter(Recipe.time.in_(time_list))
    if difficulty_list:  # Si hay valores en la lista de dificultades
        query = query.filter(Recipe.difficulty.in_(difficulty_list))
    if type:
        query = query.filter(Recipe.type == type)

    if contains_ingredients:
        for ingredient_id in contains_ingredients:
            query = query.filter(
                Recipe.ingredients.any(ConcreteIngredient.ingredient_id == ingredient_id)
            )

    if excludes_ingredients:
        query = query.filter(
            ~Recipe.ingredients.any(
                ConcreteIngredient.ingredient_id.in_(excludes_ingredients)
            )
        )

    # Ordenar los resultados por número de favoritos y por ID
    query = query.order_by(Recipe.favorites_count.desc(), Recipe.id.asc())

    # Obtener las recetas con paginación
    recipes = query.offset(offset).limit(limit).all()
    recipes_data = [recipe.to_simple_dto(lang) for recipe in recipes]
    has_more = has_more_results(query, offset, limit)
    return jsonify({"recipes": recipes_data, 
                    "has_more": has_more},
                    ), 200

# GRID 2
def get_recipes_similar_to(recipe, offset, limit, lang):
    query = Recipe.query.order_by(Recipe.favorites_count.desc(), Recipe.id.asc()) \
        .filter((Recipe.time == recipe.time) | (Recipe.difficulty == recipe.difficulty)) \
        .filter(Recipe.id != recipe.id) \
        .filter(Recipe.type == recipe.type if recipe.type != "others" else Recipe.type.isnot(None))

    similar_recipes = query.offset(offset).limit(limit).all()
    recipes_data = [recipe.to_simple_dto(lang) for recipe in similar_recipes]
    has_more = has_more_results(query, offset, limit)
    return jsonify({"recipes": recipes_data, "has_more": has_more}), 200

def new_recipe(user, data):
    # Verifica que se proporcione la información requerida
    if not data or not all(key in data for key in ('title', 'ingredients', 'procedure', 'images', 'time', 'difficulty', 'type')) or len(data.get('procedure')) == 0 or len(data.get('images')) == 0:
        return no_requested_info_error()

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
        for file_path in existing_images:
            delete_recipe(os.path.basename(file_path))
        return no_recipe_uploaded_error()

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

    # Agregar la receta a la base de datos
    # Crear los ingredientes concretos
    try:
        db.session.add(new_recipe)
        db.session.flush()  # Para obtener el ID de la receta antes de hacer commit

        for ingredient_data in ingredients_data:
            ingredient_id = ingredient_data.get('id')
            amount = ingredient_data.get('amount')

            if ingredient_id is None or amount is None:
                continue 
            
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
        response = make_response()
        response.status_code = 204

        base_url = request.host_url.rstrip('/')
        response.headers["Location"] = f"{base_url}/api/recipes/{new_recipe.id}"
        return response

    except SQLAlchemyError:
        db.session.rollback()
        return no_recipe_uploaded_error()

@app.route('/api/recipes/categories', methods=['GET'])
def get_recipe_categories():
    time_options = Recipe.get_time_options()  # Obtener los valores posibles de 'tiempo'
    difficulty_options = Recipe.get_difficulty_options()  # Obtener los valores posibles de 'dificultad'
    type_options = Recipe.get_type_options()  # Obtener los valores posibles de 'tipo'
    
    return jsonify({"name":"time", "options": time_options}, 
                    {"name":"difficulty", "options": difficulty_options},
                    {"name":"type", "options": type_options}), 200

@app.route('/api/recipes/<int:id>', methods=['GET', 'DELETE', 'PATCH'])
@jwt_required(optional=True)
def recipes_id(id):
    if id < 0:
        return no_valid_id_provided()
    
    lang = request.args.get('lang', default="", type=str)

    #AQUI MANTENGO EL OPTIONAL PORQUE SI NO HAY TOKEN
    # CLIENT=None
    #SI HAY TOKEN DEBE SER VALIDO
    client = get_user_from_token(get_jwt())    
    method = request.method
    if method == 'GET':
        return recipe_details(id, client, lang)
    
    recipe = Recipe.query.get(id)
    if not has_permission(client, recipe):
            return no_permission_error()
    if method == 'DELETE':  
        return delete_recipe(recipe)
    if method == 'PATCH':
        return update_recipe(recipe, request.json)
    
def update_recipe(recipe, data):
    if not data or not any(key in data for key in ('title', 'ingredients', 'procedure', 'images', 'time', 'difficulty', 'type')):
        return no_requested_info_error()

    try:
        if 'title' in data:
            recipe.title = data['title']
        if 'time' in data:
            recipe.time = data['time']
        if 'difficulty' in data:
            recipe.difficulty = data['difficulty']
        if 'type' in data:
            recipe.type = data['type']

        if 'procedure' in data:
            procedure = data['procedure']
            if not procedure or len(procedure) == 0:
                raise Exception("Procedimiento vacio")
            recipe.procedure = procedure
        
        if 'ingredients' in data:
            ingredients_data = data['ingredients']

            # Eliminar ingredientes anteriores
            ConcreteIngredient.query.filter_by(recipe_id=recipe.id).delete()

            # Crear los nuevos ingredientes concretos
            concrete_ingredients = []
            for ingredient_data in ingredients_data:
                ingredient_id = ingredient_data.get('id')
                amount = ingredient_data.get('amount')

                if ingredient_id is None or amount is None:
                    continue

                concrete_ingredient = ConcreteIngredient(
                    ingredient_id=ingredient_id,
                    amount=amount,
                    recipe_id=recipe.id
                )
                concrete_ingredients.append(concrete_ingredient)

            db.session.add_all(concrete_ingredients)

        if 'images' in data:
            new_images = data.get('images', [])
            new_images = [os.path.basename(image) for image in new_images]
            if len(new_images) == 0:
                raise Exception("Imagenes vacias")
            # Identificar imágenes que ya no se necesitan
            images_to_keep = set(recipe.images).intersection(set(new_images))
            images_to_delete = set(recipe.images) - images_to_keep
            images_to_add = set(new_images) - images_to_keep

            # Validar que las imágenes nuexistan en el servidor
            all_images_exist = True
            valid_new_images = []
            for filename in images_to_add:
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                if os.path.isfile(file_path):
                    valid_new_images.append(filename)
                else:
                    all_images_exist = False

            if not all_images_exist:
                # Si alguna de las nuevas imágenes no existe, aborta la operación
                raise Exception("Alguna imagen  no existe")       
            
            # Actualizar las imágenes en la receta (manteniendo xistentes y agregando las nuevas)
            recipe.images = list(images_to_keep.union(valid_new_images))

        # Guardar los cambios en la base de datos
        db.session.commit()
        if 'images' in data:
            delete_images_by_filenames(list(images_to_delete))
        return '', 204

    except Exception:
        db.session.rollback()
        return no_recipe_uploaded_error()

def recipe_details(id, client, lang):
    recipe = Recipe.query.get(id)
    if recipe is None:
        return recipe_not_found_error()
    recipe_dto = recipe.to_details_dto(lang)
    recipe_dto["isFav"] = client.is_favorite(recipe) if client else False
    recipe_dto["isCart"] = client.is_in_cart(recipe) if client else False
    return jsonify(recipe_dto), 200

def delete_recipe(recipe):
    filenames = recipe.images
    try:
        db.session.delete(recipe)
        db.session.commit()
        delete_images_by_filenames(filenames)
        return '', 204
    except SQLAlchemyError:
        db.session.rollback()
    return unexpected_error()

@app.route('/api/recipes/ingredients', methods=['GET', 'POST'])
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
        except Exception:
            return invalid_token()
        user = get_user_from_token(get_jwt())
        if not is_admin(user):
            return no_permission_error()

        try:
            # Leer el cuerpo de la solicitud
            data = request.get_json()
            if not isinstance(data, list):
                return no_requested_info_error()

            errores = []
            for ingredient_data in data:
                # Validar los campos obligatorios
                if not all(key in ingredient_data for key in ["name_en","name_es", "default_unit"]):
                    errores.append(f"Faltan campos en el ingrediente: {ingredient_data}")
                    continue

                if ingredient_data["default_unit"] not in ["g", "kg", "ml", "l", "units"]:
                    errores.append(f"Unidad no valida: {ingredient_data}")
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
            return '', 204

        except Exception:
            db.session.rollback()  # Deshacer los cambios en caso de error
            return unexpected_error()
