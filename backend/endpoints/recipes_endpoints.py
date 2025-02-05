from config import app, db, RECIPE_CART_SIZE
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, verify_jwt_in_request
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_token
import os
from utils import delete_images_by_filenames, has_permission, is_admin
from errors import *

@app.route('/api/recipes', methods=['GET', 'POST'])
#@jwt_required(optional=True)
def recipes():
    method = request.method
    if method == 'GET':
        user_id = request.args.get('user_id', default=-1, type=int)
        recipe_id = request.args.get('recipe_id', default=-1, type=int)
        recommendations_for_user_id = request.args.get('recommendations_for_user_id', default=-1, type=int)
        favourited_by = request.args.get('favourited_by', default=-1, type=int)
        carted_by = request.args.get('carted_by', default=-1, type=int)
 
        offset = request.args.get('offset', default=0, type=int)
        limit = request.args.get('limit', default=10, type=int)

        lang = request.args.get('lang', default="", type=str)
        
        if user_id > 0:
            user = User.query.get(user_id)
            if user is None:
                return user_not_found_error()
            return get_recipes_from_user(user, offset, limit, lang)
        elif recipe_id > 0:
            recipe = Recipe.query.get(recipe_id)
            if recipe is None:
                return recipe_not_found_error()
            return get_recipes_similar_to(recipe, offset, limit, lang)
        elif recommendations_for_user_id > 0:
            user = User.query.get(recommendations_for_user_id)
            if user is None:
                return user_not_found_error()
            try:
                verify_jwt_in_request() 
            except Exception as e:
                return invalid_token()
            
            client = get_user_from_token(get_jwt())
            if not has_permission(client, user):
                return no_permission_error()
            return get_recommendations_for_user(user, offset, limit, lang)
        elif favourited_by > 0:
            user = User.query.get(favourited_by)
            if user is None:
                return user_not_found_error()
            try:
                verify_jwt_in_request() 
            except Exception as e:
                return invalid_token()
            
            client = get_user_from_token(get_jwt())
            if not has_permission(client, user):
                return no_permission_error()
            return get_favorites_recipes(user, offset, limit, lang)
        elif carted_by > 0:    
            user = User.query.get(carted_by)
            if user is None:
                return user_not_found_error()
            try:
                verify_jwt_in_request() 
            except Exception as e:
                return invalid_token()
            
            client = get_user_from_token(get_jwt())
            if not has_permission(client, user):
                return no_permission_error()
            return get_cart_recipes(user, lang)
        else:
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

def has_more_results(query, offset, limit):
    return query.offset(offset + limit).first() is not None

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

# GRID 3
def get_recipes_similar_to(recipe, offset, limit, lang):
    query = Recipe.query.order_by(Recipe.favorites_count.desc(), Recipe.id.asc()) \
        .filter((Recipe.time == recipe.time) | (Recipe.difficulty == recipe.difficulty)) \
        .filter(Recipe.id != recipe.id) \
        .filter(Recipe.type == recipe.type if recipe.type != "others" else Recipe.type.isnot(None))

    similar_recipes = query.offset(offset).limit(limit).all()
    recipes_data = [recipe.to_simple_dto(lang) for recipe in similar_recipes]
    has_more = has_more_results(query, offset, limit)
    return jsonify({"recipes": recipes_data, "has_more": has_more}), 200

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
        response = jsonify({"msg": "Receta publicada con éxito"})
        response.status_code = 201
        response.headers["Location"] = f"/api/recipes/{new_recipe.id}"
        return response

    except SQLAlchemyError as e:
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
                raise Exception()
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
            if len(new_images) == 0:
                raise Exception()
            # Identificar imágenes que ya no se necesitan
            images_to_keep = set(recipe.images).intersection(set(new_images))
            images_to_delete = set(recipe.images) - images_to_keep
            images_to_add = set(new_images) - images_to_keep

            # Validar que las imágenes nuevas existan en el servidor
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
                raise Exception()       
            
            # Actualizar las imágenes en la receta (manteniendo las existentes y agregando las nuevas)
            recipe.images = list(images_to_keep.union(valid_new_images))

        # Guardar los cambios en la base de datos
        db.session.commit()
        if 'images' in data:
            delete_images_by_filenames(list(images_to_delete))
        return '', 204

    except Exception as e:
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
    except SQLAlchemyError as e:
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
            elif len(errores) == len(data):
                return jsonify({"message": "Todos los ingredientes enviados ya estaban agregados."}), 202
            return jsonify({"message": "Todos los ingredientes se agregaron con éxito."}), 201

        except Exception:
            db.session.rollback()  # Deshacer los cambios en caso de error
            return unexpected_error()
        
@app.route('/api/recipes/<int:idR>/favourite/<int:idU>', methods=['POST', 'DELETE'])
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
        return recipe_added_to_fav()
    try:
        favorite = FavoriteRecipe(user_id=user.id, recipe_id=recipe.id)
        db.session.add(favorite)
        db.session.commit()
        return recipe_added_to_fav()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al añadir receta favorita."}), 400
    
def rm_favorite(user, recipe): 
    favorite = FavoriteRecipe.query.filter_by(user_id=user.id, recipe_id=recipe.id).first()
    if not favorite:
        return recipe_removed_from_fav()
    try:
        db.session.delete(favorite)
        db.session.commit()
        return recipe_removed_from_fav()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar receta favorita."}), 400
    
@app.route('/api/recipes/<int:idR>/cart/<int:idU>', methods=['POST', 'DELETE'])
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
        return recipe_added_to_cart()
    if(user.get_cart_recipes_count() >= RECIPE_CART_SIZE):
        return jsonify({"error": "No hay más espacio disponible en la cesta."}), 409
    try:
        cartEntry = CartRecipe(user_id=user.id, recipe_id=recipe.id)
        db.session.add(cartEntry)
        db.session.commit()
        return recipe_added_to_cart()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al añadir receta a la cesta."}), 400
    
def rm_cart_recipe(user, recipe): 
    cartEntry = CartRecipe.query.filter_by(user_id=user.id, recipe_id=recipe.id).first()
    if not cartEntry:
        return recipe_removed_from_cart()
    try:
        db.session.delete(cartEntry)
        db.session.commit()
        return recipe_removed_from_cart()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar receta de la cesta."}), 400
        
def recipe_added_to_fav():
    return jsonify({"msg": "Receta añadida a favoritos."}), 201
def recipe_removed_from_fav():
    return '', 204
def recipe_added_to_cart():
    return jsonify({"msg": "Receta añadida a la cesta."}), 201
def recipe_removed_from_cart():
    return '', 204
