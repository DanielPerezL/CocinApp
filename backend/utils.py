from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import *

#Devuele un objeto de clase User o None
def get_user_from_identity(identity):
    if identity is None:
        return None
    user = User.query.get(identity.get("id"))
    if user is None or user.password_hash!=identity.get("password_hash"):
        return None
    return user
    