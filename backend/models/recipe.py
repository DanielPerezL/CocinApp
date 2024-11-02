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
            "images": [
                "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fassets.afcdn.com%2Frecipe%2F20190319%2F89655_w3072h2304c1cx3680cy2456.jpg&f=1&nofb=1&ipt=0835971addd8c8acf48502c72127b86b91c8210d9cf40f4ede80c79fa863258c&ipo=images",
                "https://www.schlotzskys.com/-/media/schlotzskys/menu/pizza/supreme_pizza_1200x800.jpg?v=1&d=20220823T063817Z",
            ]
        }
    
    def to_simple_dto(self):
        return {
            "id" : self.id,
            "title" : self.title,
            "user" : self.user_id,
            "image": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fassets.afcdn.com%2Frecipe%2F20190319%2F89655_w3072h2304c1cx3680cy2456.jpg&f=1&nofb=1&ipt=0835971addd8c8acf48502c72127b86b91c8210d9cf40f4ede80c79fa863258c&ipo=images"
        }