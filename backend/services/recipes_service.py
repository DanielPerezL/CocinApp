from models import *
from config import app, db
import os
from utils import delete_images_by_filenames
from exceptions import ConflictException, NotFoundException, AppException, BadRequestException
from utils import has_more_results
from sqlalchemy.exc import SQLAlchemyError


class RecipesService():

    # GRID 1
    @staticmethod
    def get_recipes_simple_dto(request, offset, limit, lang):
        # PARAMETROS DE BUSQUEDA
        title = request.args.get('title', default="", type=str)  
        min_steps = request.args.get('min_steps', default=0, type=int)
        max_steps = request.args.get('max_steps', default=None, type=int)
        time_list = request.args.getlist('time', type=str)
        difficulty_list = request.args.getlist('difficulty', type=str)
        type = request.args.get('type', default=None, type=str)  
        contains_ingredients = request.args.getlist('c_i', type=int)
        excludes_ingredients = request.args.getlist('e_i', type=int)

        query = Recipe.query

        # Aplicar filtros de búsqueda
        if title:
            query = query.filter(Recipe.title.ilike(f"%{title}%"))
        if min_steps > 0:
            query = query.filter(db.func.json_length(Recipe.procedure) >= min_steps)
        if max_steps is not None:
            query = query.filter(db.func.json_length(Recipe.procedure) <= max_steps)
        if time_list:
            query = query.filter(Recipe.time.in_(time_list))
        if difficulty_list:
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
        return {"recipes": recipes_data, 
                "has_more": has_more}

    # GRID 2
    @staticmethod
    def get_recipes_similar_to(recipe, offset, limit, lang):
        query = Recipe.query.order_by(Recipe.favorites_count.desc(), Recipe.id.asc()) \
            .filter((Recipe.time == recipe.time) | (Recipe.difficulty == recipe.difficulty)) \
            .filter(Recipe.id != recipe.id) \
            .filter(Recipe.type == recipe.type if recipe.type != "others" else Recipe.type.isnot(None))

        similar_recipes = query.offset(offset).limit(limit).all()
        recipes_data = [recipe.to_simple_dto(lang) for recipe in similar_recipes]
        has_more = has_more_results(query, offset, limit)
        return {"recipes": recipes_data, "has_more": has_more}
    
    # GRID 3
    @staticmethod
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
            return {"recipes": [], "has_more": False}

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
        return {"recipes": recommended_recipes_data, 
                "has_more": has_more}

    # GRID 4
    @staticmethod
    def get_recipes_from_user(user, offset, limit, lang):
        query = Recipe.query.filter_by(user_id=user.id)
        recipes = query.offset(offset).limit(limit).all()
        recipes_data = [recipe.to_simple_dto(lang) for recipe in recipes]
        has_more = has_more_results(query, offset, limit)
        return {"recipes": recipes_data, "has_more": has_more}

    # GRID 5
    @staticmethod
    def get_favorites_recipes(user, offset, limit, lang):
        recipes = [recipe.to_simple_dto(lang) for recipe in user.get_favorite_recipes(offset, limit)]
        total_favorites = user.get_favorite_recipes_count()  # Método para contar las recetas favoritas del usuario
        has_more = (offset + limit) < total_favorites

        # Devolver la respuesta con `recipes` y `has_more`
        return {"recipes": recipes, "has_more": has_more}

    # GRID 6
    @staticmethod
    def get_cart_recipes(user, lang):    
        # No usamos limit/offset porque el carrito se limita a RECIPE_CART_SIZE recetas
        recipes = [recipe.to_simple_dto(lang) for recipe in user.get_cart_recipes()]
        return {"recipes": recipes, "has_more": False}


    @staticmethod
    def new_recipe(user, data):
        new_recipe = Recipe.store_recipe(data=data, user=user)
        if not new_recipe:
            raise ConflictException()

        return new_recipe
    
    @staticmethod
    def get_categories():
        time_options = Recipe.get_time_options()  # Obtener los valores posibles de 'tiempo'
        difficulty_options = Recipe.get_difficulty_options()  # Obtener los valores posibles de 'dificultad'
        type_options = Recipe.get_type_options()  # Obtener los valores posibles de 'tipo'
            
        return ({"name":"time", "options": time_options}, 
                {"name":"difficulty", "options": difficulty_options},
                {"name":"type", "options": type_options})
    
    @staticmethod
    def recipe_details(id, client, lang):
        recipe = Recipe.query.get(id)
        if recipe is None:
            raise NotFoundException()
        recipe_dto = recipe.to_details_dto(lang)
        recipe_dto["isFav"] = client.is_favorite(recipe) if client else False
        recipe_dto["isCart"] = client.is_in_cart(recipe) if client else False
        return recipe_dto
    
    @staticmethod
    def delete_recipe(recipe):
        filenames = recipe.images
        try:
            db.session.delete(recipe)
            db.session.commit()
            delete_images_by_filenames(filenames)
        except SQLAlchemyError:
            db.session.rollback()
            raise AppException()
    
    @staticmethod
    def update_recipe(recipe, data):
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
                    raise Exception("Alguna imagen no existe")       
                
                # Actualizar las imágenes en la receta (manteniendo xistentes y agregando las nuevas)
                recipe.images = list(images_to_keep.union(valid_new_images))

            # Guardar los cambios en la base de datos
            db.session.commit()
            if 'images' in data:
                delete_images_by_filenames(list(images_to_delete))

        except Exception:
            db.session.rollback()
            raise ConflictException()

    @staticmethod
    def get_ingredients(lang):
        # Obtener todos los ingredientes disponibles
        ingredients = Ingredient.query.all()
        return [ingredient.to_dto(lang) for ingredient in ingredients]
    
    @staticmethod
    def add_ingredients(data):        
        try:
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

        except Exception:
            db.session.rollback()  # Deshacer los cambios en caso de error
            return AppException()

                    

