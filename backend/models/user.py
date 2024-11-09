from werkzeug.security import generate_password_hash, check_password_hash
from config import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    picture = db.Column(db.String(120))
    password_hash = db.Column(db.String(200), nullable=False)
    recipes = db.relationship('Recipe',
                              backref='user',
                              lazy=True,
                              cascade='all, delete-orphan',
                              )
    favorite_recipes = db.relationship('FavoriteRecipe', back_populates='user')

    def __init__(self, nickname, email, password):
        self.nickname = nickname
        self.email = email
        self.password_hash = generate_password_hash(password)

    # Métodos para añadir y quitar recetas de favoritos
    def add_favorite_recipe(self, recipe):
        if not self.is_favorite(recipe):
            # Crear una nueva instancia de FavoriteRecipe
            favorite = FavoriteRecipe(user_id=self.id, recipe_id=recipe.id)
            db.session.add(favorite)
            db.session.commit()

    def remove_favorite_recipe(self, recipe):
        favorite = FavoriteRecipe.query.filter_by(user_id=self.id, recipe_id=recipe.id).first()
        if favorite:
            db.session.delete(favorite)
            db.session.commit()
            
    def is_favorite(self, recipe):
        return FavoriteRecipe.query.filter_by(user_id=self.id, recipe_id=recipe.id).count() > 0
    
    def get_favorite_recipes(self):
        favorite_recipes = FavoriteRecipe.query.filter_by(user_id=self.id).all()
        return [favorite.recipe for favorite in favorite_recipes]    

    def get_picture(self):
        return self.picture
    
    def set_picture(self, new_picture):
        self.picture = new_picture

    def __repr__(self):
        return f'<p>{self.nickname}</p>'
    
    def to_dto(self):
        #Usuario DTO
        return {
            'id': self.id,
            'nickname': self.nickname,
            'picture': self.picture,
            'email': self.email,
        }
    
    #Usuario DTO publico     
    def to_public_dto(self):
        return {
            'nickname': self.nickname,
            'picture': self.picture,
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