from config import db
from .user import User, FavoriteRecipe
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import select, func

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer,
                        db.ForeignKey('user.id'),
                        nullable=False)
    title = db.Column(db.String(80), nullable=False)
    ingredients = db.Column(db.Text, nullable=False)
    procedure = db.Column(db.JSON, nullable=False)
    images = db.Column(db.JSON, nullable=True)  # Campo para almacenar URLs de imágenes, en formato JSON
    time = db.Column(db.Enum("<20min", "20-40min", "40-90min", ">90min", name='tiempo_enum'), nullable=False)  # Tiempo
    difficulty = db.Column(db.Enum("easy", "medium", "hard", "expert", name='dificultad_enum'), nullable=False)  # Dificultad
    favorited_by = db.relationship('FavoriteRecipe',
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

    def __init__(self, title, user_id, ingredients, procedure, time, difficulty, images=None):
        self.title = title
        self.user_id = user_id
        self.ingredients = ingredients
        self.procedure = procedure
        self.time = time
        self.difficulty = difficulty
        self.images = images if images is not None else []  # Inicializa como lista vacía si no se proporcionan imágenes

    def __repr__(self):
        return f'<Recipe {self.title}>'

    # DTO para la vista detallada de la receta
    def to_details_dto(self):
        return {
            "id": self.id,
            "title": self.title,
            "user_id": self.user_id,
            "ingredients": self.ingredients,
            "procedure": self.procedure,
            "time": self.time,
            "difficulty": self.difficulty,
            "images": self.images  # Convertir la cadena de imágenes en una lista
        }

    # DTO para la vista simple de la receta
    def to_simple_dto(self):
        return {
            "id": self.id,
            "title": self.title,
            "image": self.images[0] if self.images else None,
            "time": self.time,
            "difficulty": self.difficulty,
        }
