from config import *
from flask import Flask, jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import *

#Porcion del API relacionada con el acceso de los usuarios
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json

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
    return jsonify(access_token=access_token, refresh_token=refresh_token), 200

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

    return jsonify({
        "nickname": user.nickname,
        "email": user.email,
    }), 200

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


# Zona para la gestiond de las recetas
@app.route('/api/new_recipe', methods=['POST'])
@jwt_required()
def new_recipe():
    data = request.json
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"msg": "User not found"}), 404
    
    new_recipe = Recipe(title = data.get('title'),
                        user_id = user.id,
                        ingredients = data.get('ingredients'),
                        procedure = data.get('procedure'),
                        )
    try:
        db.session.add(new_recipe)
        db.session.commit()
        return jsonify({"msg": "Recipe uploaded successfully"}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
    return jsonify({"msg": "Get sure to provide all requested data"}), 400

@app.route('/api/delete_recipe', methods=['DELETE'])
@jwt_required()
def delete_recipe():
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"msg": "User not found"}), 404
    
    data = request.json
    recipe = Recipe.query.get(data.get('recipe_id'))
    if recipe is None:
        return jsonify({"msg": "Recipe not found"}), 404
    try:
        db.session.delete(recipe)
        db.session.commit()
        return 204
    except SQLAlchemyError as e:
        db.session.rollback()
    return jsonify({"msg": "Unexpected error occurred"}), 500

#Zona para comprobar tablas
@app.route('/api/users', methods=['GET'])
def users():
    users = User.query.all()
    users_data = [user.to_dict() for user in users]
    return jsonify(users_data), 200

@app.route('/api/recipes', methods=['GET'])
def recipes():
    recipes = Recipe.query.all()
    recipes_data = [recipe.to_dict() for recipe in recipes]
    return jsonify(recipes_data), 200


with app.app_context():
    db.create_all()

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

