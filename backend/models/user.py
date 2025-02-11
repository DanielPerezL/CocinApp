from werkzeug.security import generate_password_hash, check_password_hash
from config import db, NICKNAME_MAX_LENGTH
from flask import request 

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.String(NICKNAME_MAX_LENGTH), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    picture = db.Column(db.String(120))
    password_hash = db.Column(db.String(200), nullable=False)
    recipes = db.relationship('Recipe',
                              backref='user',
                              lazy=True,
                              cascade='all, delete-orphan',
                              )
    favorite_recipes = db.relationship('FavoriteRecipe', 
                                       back_populates='user',
                                       cascade='all, delete-orphan')
    cart_recipes = db.relationship('CartRecipe', 
                                    back_populates='user',
                                    cascade='all, delete-orphan')

    def __init__(self, nickname, email, password):
        self.nickname = nickname
        self.email = email
        self.password_hash = generate_password_hash(password)

    def is_favorite(self, recipe):
        return FavoriteRecipe.query.filter_by(user_id=self.id, recipe_id=recipe.id).count() > 0
    
    def get_favorite_recipes(self, offset=None, limit=None):
        query = FavoriteRecipe.query.filter_by(user_id=self.id)
        if offset is not None:
            query = query.offset(offset)
        if limit is not None:
            query = query.limit(limit)    
        favorite_recipes = query.all() 
        return [favorite.recipe for favorite in favorite_recipes]    

    def get_favorite_recipes_count(self):
        return FavoriteRecipe.query.filter_by(user_id=self.id).count()

    def get_cart_recipes(self):
        query = CartRecipe.query.filter_by(user_id=self.id)   
        cart_recipes = query.all() 
        return [entry.recipe for entry in cart_recipes]    

    def get_cart_recipes_count(self):
        return CartRecipe.query.filter_by(user_id=self.id).count()

    def is_in_cart(self, recipe):
        return CartRecipe.query.filter_by(user_id=self.id, recipe_id=recipe.id).count() > 0
    
    def get_picture(self):
        return self.picture
    
    def set_picture(self, new_picture):
        self.picture = new_picture

    def __repr__(self):
        return f'<p>{self.nickname}</p>'
    
    def to_dto(self):
        base_url = request.host_url.rstrip('/')

        #Usuario DTO
        return {
            'id': self.id,
            'nickname': self.nickname,
            'pictureURL': f"{base_url}/api/images/{self.picture}" if self.picture and self.picture != "" else "",
            'email': self.email,
        }
    
    #Usuario DTO publico     
    def to_public_dto(self):
        base_url = request.host_url.rstrip('/')

        return {            
            'id': self.id,
            'nickname': self.nickname,
            'pictureURL': f"{base_url}/api/images/{self.picture}" if self.picture and self.picture != "" else "",
            }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class FavoriteRecipe(db.Model):
    __tablename__ = 'favorite_recipes'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), primary_key=True)

    user = db.relationship('User', back_populates='favorite_recipes')
    recipe = db.relationship('Recipe', back_populates='favorited_by')


class CartRecipe(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), primary_key=True)

    user = db.relationship('User', back_populates='cart_recipes')
    recipe = db.relationship('Recipe', back_populates='carted_by')