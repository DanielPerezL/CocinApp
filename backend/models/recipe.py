from config import db
from .user import User, favorite_recipes

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer,
                        db.ForeignKey('user.id'),
                        nullable=False)
    title = db.Column(db.String(80), nullable=False)
    ingredients = db.Column(db.Text, nullable=False)
    procedure = db.Column(db.Text, nullable=False)
    images = db.Column(db.Text, nullable=True)  # Campo para almacenar URLs de imágenes, en formato JSON

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
            "images": self.images.split(',') if self.images else []  # Convertir la cadena de imágenes en una lista
        }

    # DTO para la vista simple de la receta
    def to_simple_dto(self):
        return {
            "id": self.id,
            "title": self.title,
            "image": self.images.split(',')[0] if self.images else None  # Usar la primera imagen o None
        }
