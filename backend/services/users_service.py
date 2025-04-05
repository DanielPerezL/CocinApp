from models import User
from config import NICKNAME_MAX_LENGTH, RECIPE_CART_SIZE
import os
from utils import *
from exceptions import *
import re
from sqlalchemy.exc import SQLAlchemyError


class UsersService():

    @staticmethod
    def add_user(nickname, email, password):    
        if not re.match("^[a-zA-Z0-9ñÑ]*$", nickname):
            raise InvalidNicknameException()
        if User.query.filter_by(email=email).first() is not None:
            raise UserEmailInUseException() 
        if len(nickname) > NICKNAME_MAX_LENGTH:
            raise TooLongNicknameException()
        
        new_user = User.store_user(nickname,
                        email,
                        password,
                        )
        if not new_user:
            raise UserNickInUseException() 
        
    @staticmethod
    def get_user(id):
        user = User.query.get(id)
        if user is None:
            #COMPROBAR SI SE RECIBE EL NICKNAME
            user = User.query.filter_by(nickname=id).first()
            if user is None:
                raise NotFoundException()
        return user
    
    @staticmethod
    def update_user(user, data):
        #Cambiar contraseña
        if data and all(key in data for key in ('current_password', 'new_password'))\
                and not any(key in data for key in ('picture', )):
            return UsersService.__change_password(user, data.get('current_password'), data.get('new_password'))
        
        #Cambiar/Borrar foto
        if data and all(key in data for key in ('picture', ))\
                and not any(key in data for key in ('current_password', 'new_password')):
            return UsersService.__new_user_picture(user, data.get("picture"))  
        
        raise BadRequestException()
    
    @staticmethod
    def __new_user_picture(user, new_picture): 
        old_picture = user.get_picture()
        if old_picture:
            delete_image(old_picture)

        flag = user.set_picture(new_picture)
        if not flag:
            raise ConflictException()

    
    @staticmethod
    def __change_password(user, current_password, new_password):
        if not user.check_password(current_password):
            raise UnauthorizedException()
        
        flag = user.set_password(new_password)
        if not flag:
            raise UnauthorizedException()


    @staticmethod
    def delete_account(deleting_user):
        try:
            db.session.delete(deleting_user)
            # DELETE ORPHAN ELIMINA LAS RECETAS
            db.session.commit()

            # Al eliminar su cuenta eliminamos tambien todas sus recetas del sistema
            delete_images_by_uploader(deleting_user)
        except SQLAlchemyError:
            db.session.rollback()
            raise AppException()
    

    @staticmethod
    def add_favorite(user, recipe):
        if(user.is_favorite(recipe)):
            return
        status = user.add_favorite(recipe)
        if not status:
            raise AppException()
        
    
    @staticmethod    
    def rm_favorite(user, recipe): 
        if not user.is_favorite(recipe):
            return
        status = user.rm_favorite(recipe)
        if not status:
            raise AppException()

    @staticmethod
    def add_cart_recipe(user, recipe):
        if user.is_in_cart(recipe):
            return
        if user.get_cart_recipes_count() >= RECIPE_CART_SIZE:
            raise CartFullException()
        status = user.add_cart_recipe(recipe)
        if not status:
            raise AppException()
            
    @staticmethod    
    def rm_cart_recipe(user, recipe): 
        if not user.is_in_cart(recipe):
            return
        status = user.rm_cart_recipe(recipe)
        if not status:
            raise AppException()

