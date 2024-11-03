from config import app, db
from flask import jsonify, request, make_response
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_identity

@app.route('/api/users', methods=['GET'])
def users():
    users = User.query.all()
    users_data = [user.to_dto() for user in users]
    return jsonify(users_data), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    #TODO: AL NO EXISTE data['...'] -> peta 500 internal server error
    if not data['nickname'] or not data['email'] or not data['password']:
        return jsonify({"msg": "Get sure to provide all requested data"}), 400

    if User.query.filter_by(email=data.get('email')).first() is not None:
        return jsonify({"msg": "Email already registered"}), 400

    new_user = User(nickname = data.get('nickname'),
                    email = data.get('email'),
                    password = data.get('password')
                    )
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"msg": "User created successfully"}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
    return jsonify({"msg": "Already taken user name or email"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    print(request)
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return jsonify({"msg": "Bad email or password"}), 401

    access_token = create_access_token(identity = {"id": user.id, 
                                                   "password_hash": user.password_hash,
                                                   })
    refresh_token = create_refresh_token(identity = {"id": user.id,
                                                     "password_hash": user.password_hash,
                                                     })
    response = make_response(jsonify({"msg": "Login successful"}))

    # Retorna los tokens en el cuerpo de la respuesta
    return jsonify({
        "msg": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token
    }), 200

@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    print(request)
    response = jsonify({"msg": "Logout successful"})
    response.delete_cookie('access_token')  # Elimina la cookie del access_token
    response.delete_cookie('refresh_token')  # Elimina la cookie del refresh_token
    return response, 200


@app.route('/api/change_password', methods=['POST'])
@jwt_required()
def change_password():
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"msg": "Bad token"}), 401
    print(user.to_dict())
    
    data = request.json
    if not data['current_password'] or not data['new_password']:
        return jsonify({"msg": "Get sure to provide all requested data"}), 401

    current_password = data.get('current_password')
    new_password = data.get('new_password')
    if not user.check_password(current_password):
        return jsonify({"msg": "Incorrect current password"}), 401
    
    user.set_password(new_password)
    try:
        db.session.commit()
        return jsonify({"msg": "Password updated successfully"}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
    return jsonify({"msg": "Unexpected error occurred"}), 500


@app.route('/api/refresh_access_token', methods=['POST'])
@jwt_required(refresh=True)
def refresh_access_token():
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"msg": "Bad token"}), 401
    new_access_token = create_access_token(identity = {"id": user.id, 
                                                       "password_hash": user.password_hash,
                                                       })
    return jsonify(access_token=new_access_token), 200


@app.route('/api/logged_user_profile', methods=['GET'])
@jwt_required()
def logged_user_profile():
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"msg": "User not found"}), 404

    return jsonify(user.to_dto()), 200

@app.route('/api/delete_account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"msg": "User not found"}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        return 204
    except SQLAlchemyError as e:
        db.session.rollback()
    return jsonify({"msg": "Unexpected error occurred"}), 500
