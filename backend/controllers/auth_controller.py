from config import app
from flask import jsonify, request, make_response
from flask_jwt_extended import (
                                jwt_required, 
                                set_access_cookies, 
                                set_refresh_cookies, 
                                unset_jwt_cookies,
                                get_jwt_identity
                                )
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import *
from errors import no_requested_info_error

@app.route('/api/auth/login', methods=['POST'])
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
    response = make_response(jsonify({"isAdmin": user.nickname == os.environ['ADMIN_USER']}))
    
    base_url = request.host_url.rstrip('/')
    response.headers["Location"] = f"{base_url}/api/users/{user.id}"
        
    #En el login no necesitamos el token csrf protect
    set_access_cookies(response, access_token, max_age=app.config['JWT_ACCESS_TOKEN_EXPIRES'])
    set_refresh_cookies(response, refresh_token, max_age=app.config['JWT_REFRESH_TOKEN_EXPIRES'])
    return response, 200

@app.route('/api/auth/logout', methods=['POST'])
def users_logout():
    response = make_response()
    unset_jwt_cookies(response)
    return response, 204

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_access_token():
    user = User.query.get(get_jwt_identity())
    if user is None:
        return jsonify({"error": "Token inválido"}), 401
    new_access_token, _ = create_tokens(user)
    resp = jsonify({'refresh': True})
    set_access_cookies(resp, new_access_token, max_age=app.config['JWT_ACCESS_TOKEN_EXPIRES'])
    return resp, 200

