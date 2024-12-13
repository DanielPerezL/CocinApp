from config import db
from .user import User, FavoriteRecipe

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer,
                        db.ForeignKey('user.id'),
                        nullable=False)
    title = db.Column(db.String(80), nullable=False)
    ingredients = db.Column(db.Text, nullable=False)
    procedure = db.Column(db.JSON, nullable=False)
    images = db.Column(db.JSON, nullable=True)  # Campo para almacenar URLs de imágenes, en formato JSON
    favorited_by = db.relationship('FavoriteRecipe',
                                   back_populates='recipe',
                                   cascade='all, delete-orphan')


    def __init__(self, title, user_id, ingredients, procedure, images=None):
        self.title = title
        self.user_id = user_id
        self.ingredients = ingredients
        self.procedure = procedure
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
            "images": self.images  # Convertir la cadena de imágenes en una lista
        }

    # DTO para la vista simple de la receta
    def to_simple_dto(self):
        return {
            "id": self.id,
            "title": self.title,
            "image": self.images[0] if self.images else None  # Usar la primera imagen o None
        }
