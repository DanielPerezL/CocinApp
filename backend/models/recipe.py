from config import db
from .user import User

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer,
                        db.ForeignKey('user.id'),
                        nullable = False,
                        )
    title = db.Column(db.String(80), nullable=False)
    ingredients = db.Column(db.Text, nullable=False)
    procedure = db.Column(db.Text, nullable=False)

    def __init__(self, title, user_id, ingredients, procedure):
        self.title = title
        self.user_id = user_id
        self.ingredients = ingredients
        self.procedure = procedure

    def __repr__(self):
        return f'<p>{self.nickname}</p>'
    
    #Voy a necesitar un DTO para la vista de la receta completa
    #Y otro DTO para la vista del /home (menos detallada)

    def to_details_dto(self):
        #Receta DTO
        return {
            "id" : self.id,
            "title" : self.title,
            "user" : self.user_id,
            "ingredients" : self.ingredients,
            "procedure" : self.procedure,
        }
    
    def to_simple_dto(self):
        return {
            "id" : self.id,
            "title" : self.title,
            "user" : self.user_id,
        }