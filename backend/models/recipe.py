from config import db

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def __init__(self, nickname, email, password):
        self.nickname = nickname
        self.email = email
        self.password_hash = password #generate_password_hash(password)

    def __repr__(self):
        return f'<p>{self.nickname}</p>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nickname': self.nickname,
            'email': self.email,
            'hashed_password': self.password_hash
        }

    
    @staticmethod
    def get_user_by_email(email):
        return Recipe.query.filter_by(email=email).first()

    @staticmethod
    def get_user_by_id(user_id):
        return Recipe.query.get(user_id)
