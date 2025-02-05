from config import app, db, NICKNAME_MAX_LENGTH
from flask import jsonify, request, make_response
from flask_jwt_extended import (
                                jwt_required, 
                                get_jwt, 
                                set_access_cookies, 
                                set_refresh_cookies, 
                                unset_jwt_cookies,
                                verify_jwt_in_request
                                )
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_token
import os
from utils import delete_images_by_uploader, create_tokens, has_permission, delete_image
from errors import *
import re

@app.route('/api/users', methods=['POST'])
def register():
    data = request.json
    if not data or not all(key in data for key in ('nickname', 'email', 'password')):
        return no_requested_info_error()
    nickname = data.get('nickname')
    
    if not re.match("^[a-zA-Z0-9ñÑ]*$", nickname):
        return jsonify({"msg": "El nickname solo puede contener letras, números y 'ñ'."}), 400
    
    if User.query.filter_by(email=data.get('email')).first() is not None:
        return user_already_exists_email()
    if len(nickname) > NICKNAME_MAX_LENGTH:
        return user_nick_too_long()
    
    new_user = User(nickname = nickname,
                    email = data.get('email'),
                    password = data.get('password')
                    )
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"msg": "Cuenta creada con éxito."}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return user_already_exists_nickname()


@app.route('/api/users/login', methods=['POST'])
def users_login():
    data = request.json
    if not data or not all(key in data for key in ('email', 'password')):
        return no_requested_info_error()

    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user is None:
        #COMPROBAMOS SI SE HA INTRODUCIDO EL NICKNAME QUE TAMBIEN ES UNICO
        nickname = email
        user = User.query.filter_by(nickname=nickname).first()
        if user is None:
            return jsonify({"error": "No existe ningún usuario con ese nombre o email."}), 400

    if not user.check_password(password):
        return jsonify({"error": "La contraseña introducida no es correcta."}), 401
        
    access_token, refresh_token = create_tokens(user)

    # Retorna los tokens en el cuerpo de la respuesta
    response = make_response(jsonify({"msg": "Inicio de sesión exitoso.", 
                                      "isAdmin": user.nickname == os.environ['ADMIN_USER'],
                                      }))
    response.headers["Location"] = f"/api/users/{user.id}"
        
    #En el login no necesitamos el token csrf protect
    set_access_cookies(response, access_token, max_age=app.config['JWT_ACCESS_TOKEN_EXPIRES'])
    set_refresh_cookies(response, refresh_token, max_age=app.config['JWT_REFRESH_TOKEN_EXPIRES'])
    return response, 200

@app.route('/api/users/logout', methods=['POST'])
def users_logout():
    response = jsonify({"msg": "Cierre de sesión exitoso."})
    unset_jwt_cookies(response)
    return response, 200

@app.route('/api/users/<string:id>', methods=['GET', 'PATCH', 'DELETE'])
@jwt_required(optional=True)
def users_id(id):
    try:
        verify_jwt_in_request() 
        client = get_user_from_token(get_jwt())    
    except Exception as e:
        client = None
        
    # Buscar al usuario por ID
    user = User.query.get(id)
    if user is None:
        #COMPROBAR SI SE RECIBE EL NICKNAME
        user = User.query.filter_by(nickname=id).first()
        if user is None:
            return user_not_found_error()

    method = request.method
    if method == 'GET':
        if has_permission(client, user):
            return jsonify(user.to_dto()), 200
        return jsonify(user.to_public_dto()), 200
        
    if not has_permission(client, user):
        return no_permission_error()    
    if method == 'PATCH':
        data = request.get_json()
        if data and all(key in data for key in ('current_password', 'new_password')):
            #Cambiar contraseña
            return change_password(user, data.get('current_password'), data.get('new_password'))
        #Cambiar/Borrar foto
        return new_user_picture(user, data.get("picture"))        
    if method == 'DELETE':
        return delete_account(user)

def new_user_picture(user, new_picture):
    if new_picture is None:
        return no_requested_info_error()
    
    old_picture = user.get_picture()
    if old_picture:
        delete_image(old_picture)

    user.set_picture(new_picture)
    try:
        db.session.commit()
        return '', 204
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al publicar modificar la imagen de su perfil. Inténtelo de nuevo más tarde."}), 400
    
def change_password(user, current_password, new_password):
    if not user.check_password(current_password):
        return jsonify({"error": "La contraseña actual introducida no es correcta."}), 401
    
    user.set_password(new_password)
    try:
        db.session.commit()
        return '', 204
    except SQLAlchemyError as e:
        db.session.rollback()
    return unexpected_error()

def delete_account(deleting_user):
    try:
        db.session.delete(deleting_user)
        #DELETE ORPHAN ELIMINA LAS RECETAS
        db.session.commit()
        delete_images_by_uploader(deleting_user)
        return '', 204
    except SQLAlchemyError as e:
        db.session.rollback()
    return unexpected_error()
