from models import User
from utils import create_tokens
from exceptions import NotFoundException, UnauthorizedException

class AuthService():

    @staticmethod
    def login(email, password):
        user = User.query.filter_by(email=email).first()
        if user is None:
            #COMPROBAMOS SI SE HA INTRODUCIDO EL NICKNAME QUE TAMBIEN ES UNICO
            nickname = email
            user = User.query.filter_by(nickname=nickname).first()
            if user is None:
                raise NotFoundException()
            
        if not user.check_password(password):
            raise UnauthorizedException()
        
        access_token, refresh_token = create_tokens(user)
        return access_token, refresh_token, user

    @staticmethod
    def refresh_access_token(user):
        new_access_token, _ = create_tokens(user)
        return new_access_token
