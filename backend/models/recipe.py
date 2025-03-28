from config import db
from .user import User, FavoriteRecipe
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import select, func
from flask import request 

class Ingredient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name_en = db.Column(db.String(80), nullable=False)
    name_es = db.Column(db.String(80), nullable=False)
    default_unit = db.Column(db.String(20), nullable=False)

    # Relación inversa con ConcreteIngredient
    concrete_ingredients = db.relationship("ConcreteIngredient", back_populates="ingredient")

    def __repr__(self):
        return f"<Ingredient {self.name_es}>"
    
    def to_dto(self, lang):
        if lang == "es":
            name = self.name_es
        elif lang == "en":
            name = self.name_en
        else:
            name = self.name_en

        return {
            "id": self.id,
            "name": name,
            "default_unit": self.default_unit,
        }

class ConcreteIngredient(db.Model):
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipe.id"), primary_key=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey("ingredient.id"), primary_key=True)
    amount = db.Column(db.Float, nullable=False)  # Unidad específica del ingrediente

    # Relación inversa con Recipe e Ingredient
    recipe = db.relationship("Recipe", back_populates="ingredients")
    ingredient = db.relationship("Ingredient", back_populates="concrete_ingredients")

    def __repr__(self):
        return f"<ConcreteIngredient {self.amount} {self.ingredient.default_unit} of {self.ingredient.name_es}>"
    
    def to_dto(self, lang):
        ing = Ingredient.query.get(self.ingredient_id)
        ingredient_data = ing.to_dto(lang)
        return {
            **ingredient_data,
            "amount": self.amount,
        }


class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer,
                        db.ForeignKey('user.id'),
                        nullable=False)
    title = db.Column(db.String(80), nullable=False)
    ingredients = db.relationship("ConcreteIngredient", back_populates="recipe", cascade="all, delete-orphan")
    procedure = db.Column(db.JSON, nullable=False)
    images = db.Column(db.JSON, nullable=True)  # Campo para almacenar URLs de imágenes, en formato JSON
    time = db.Column(db.Enum("<20min", "20-40min", "40-90min", ">90min", name='tiempo_enum'), nullable=False)  # Tiempo
    difficulty = db.Column(db.Enum("easy", "medium", "hard", "expert", name='dificultad_enum'), nullable=False)  # Dificultad
    type = db.Column(db.Enum("appetizers", "main dishes", "desserts", "drinks", "soups", "salads", "snacks", "others", name='tipo_enum'), nullable=False)  # Tipo
    favorited_by = db.relationship('FavoriteRecipe',
                                   back_populates='recipe',
                                   cascade='all, delete-orphan')
    carted_by = db.relationship('CartRecipe',
                                back_populates='recipe',
                                cascade='all, delete-orphan')
    

    @hybrid_property
    def favorites_count(self):
        return len(self.favorited_by)

    @favorites_count.expression
    def favorites_count(cls):
        return (
            select(func.count(FavoriteRecipe.user_id))
            .where(FavoriteRecipe.recipe_id == cls.id)
            .scalar_subquery()  # Importante para convertirlo en una subconsulta válida
        )
    @staticmethod
    def get_time_options():
        return ["<20min", "20-40min", "40-90min", ">90min"]

    @staticmethod
    def get_difficulty_options():
        return ["easy", "medium", "hard", "expert"]
    
    @staticmethod
    def get_type_options():
        return ["appetizers", "main dishes", "desserts", "drinks", "soups", "salads", "snacks", "others"]

    def __init__(self, title, user_id, procedure, time, difficulty, type, images=None):
        self.title = title
        self.user_id = user_id
        self.procedure = procedure
        self.time = time
        self.difficulty = difficulty
        self.type = type
        self.images = images if images is not None else []  # Inicializa como lista vacía si no se proporcionan imágenes
        
    def __repr__(self):
        return f'<Recipe {self.title}>'

    # DTO para la vista detallada de la receta
    def to_details_dto(self, lang):
        base_url = request.host_url.rstrip('/')

        return {
            "id": self.id,
            "title": self.title,
            "user_id": self.user_id,
            "ingredients": [ingredient.to_dto(lang) for ingredient in self.ingredients],
            "procedure": self.procedure,
            "time": self.time,
            "difficulty": self.difficulty,
            "type": self.type,
            "imagesURL": [f"{base_url}/api/images/{image}" for image in self.images],
        }

    # DTO para la vista simple de la receta
    def to_simple_dto(self, lang):
        base_url = request.host_url.rstrip('/')

        return {
            "id": self.id,
            "title": self.title,
            "imageURL": f"{base_url}/api/images/{self.images[0]}" if self.images else None,
            "time": self.time,
            "difficulty": self.difficulty,
            "type": self.type,
            "ingredients": [ingredient.to_dto(lang) for ingredient in self.ingredients],
            "url": f"{base_url}/api/recipes/{self.id}",
        }
    
    @staticmethod
    def store_recipe(data, user):
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
            db.session.add(new_recipe)
            db.session.flush()  # Para obtener el ID antes del commit

            # Agregar la receta a la base de datos
            # Crear los ingredientes concretos

            ingredients_data = data.get('ingredients', [])
            concrete_ingredients = []
            for ingredient_data in ingredients_data:
                ingredient_id = ingredient_data.get('id')
                amount = ingredient_data.get('amount')

                if ingredient_id is None or amount is None:
                    continue

                # Crear la entrada en ConcreteIngredient con recipe_id ya asignado
                concrete_ingredient = ConcreteIngredient(
                    ingredient_id=ingredient_id,
                    amount=amount,
                    recipe_id=new_recipe.id
                )
                concrete_ingredients.append(concrete_ingredient)

            db.session.add_all(concrete_ingredients)
            db.session.commit()
            return new_recipe

        except Exception:
            db.session.rollback()
            return False
