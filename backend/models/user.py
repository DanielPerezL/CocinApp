from werkzeug.security import generate_password_hash, check_password_hash
from config import db

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

    def __init__(self, nickname, email, password):
        self.nickname = nickname
        self.email = email
        self.password_hash = generate_password_hash(password)

    def __repr__(self):
        return f'<p>{self.nickname}</p>'
    
    def to_dto(self):
        #Usuario DTO
        return {
            'id': self.id,
            'nickname': self.nickname,
            'email': self.email,
        }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    
    @staticmethod
    def get_user_by_email(email):
        return User.query.filter_by(email=email).first()

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get(user_id)
