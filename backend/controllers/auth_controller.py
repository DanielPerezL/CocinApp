from config import app
from flask import jsonify, request, make_response
from flask_jwt_extended import (
                                jwt_required, 
                                set_access_cookies, 
                                set_refresh_cookies, 
                                unset_jwt_cookies,
                                get_jwt_identity
                                )
import os
from models import User
from exceptions import BadRequestException
from services import AuthService

@app.route('/api/auth/login', methods=['POST'])
def users_login():
    data = request.json
    if not data or not all(key in data for key in ('email', 'password')):
        raise BadRequestException()

    email = data.get('email')
    password = data.get('password')

    access_token, refresh_token, user = AuthService.login(email, password)

    # Retorna los tokens en el cuerpo de la respuesta
    response = make_response(jsonify({"isAdmin": user.nickname == os.environ['ADMIN_USER']}))
    
    base_url = request.host_url.rstrip('/')
    response.headers["Location"] = f"{base_url}/api/users/{user.id}"
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
    
    new_access_token = AuthService.refresh_access_token(user)
    
    resp = jsonify({'refresh': True})
    set_access_cookies(resp, new_access_token, max_age=app.config['JWT_ACCESS_TOKEN_EXPIRES'])
    return resp, 200

