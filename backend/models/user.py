from werkzeug.security import generate_password_hash, check_password_hash
from config import db

favorite_recipes = db.Table('favorite_recipes',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('recipe_id', db.Integer, db.ForeignKey('recipe.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    recipes = db.relationship('Recipe',
                              backref='user',
                              lazy=True,
                              cascade='all, delete-orphan',
                              )
    favorite_recipes = db.relationship('Recipe',
                                       secondary=favorite_recipes, 
                                       lazy='dynamic', 
                                       backref=db.backref('favorited_by', lazy='dynamic'))

    def __init__(self, nickname, email, password):
        self.nickname = nickname
        self.email = email
        self.password_hash = generate_password_hash(password)

    # Métodos para añadir y quitar recetas de favoritos
    def add_favorite_recipe(self, recipe):
        if not self.is_favorite(recipe):
            self.favorite_recipes.append(recipe)

    def remove_favorite_recipe(self, recipe):
        if self.is_favorite(recipe):
            self.favorite_recipes.remove(recipe)

    def is_favorite(self, recipe):
        return self.favorite_recipes.filter(favorite_recipes.c.recipe_id == recipe.id).count() > 0

    def __repr__(self):
        return f'<p>{self.nickname}</p>'
    
    def to_dto(self):
        #Usuario DTO
        return {
            'id': self.id,
            'nickname': self.nickname,
            'email': self.email,
        }
    
    #Usuario DTO publico     
    def to_public_dto(self):
        return {
            'nickname': self.nickname,
        }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    