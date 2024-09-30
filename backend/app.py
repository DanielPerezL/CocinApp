from config import *
from flask import Flask, jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import *
from sqlalchemy.exc import SQLAlchemyError

#Porcion del API relacionada con el acceso de los usuarios
@app.route('/register', methods=['POST'])
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

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return jsonify({"msg": "Bad email or password"}), 401

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify(access_token=access_token, refresh_token=refresh_token), 200

@app.route('/refresh_access_token', methods=['POST'])
@jwt_required(refresh=True)
def refresh_access_token():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify(access_token=new_access_token), 200


@app.route('/logged_user_profile', methods=['GET'])
@jwt_required()
def logged_user_profile():
    current_user_id = get_jwt_identity()
    user = User.get_user_by_id(current_user_id)
    if user is None:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "nickname": user.nickname,
        "email": user.email,
    }), 200

@app.route('/delete_account', methods=['DELETE'])
@jwt_required()
def delete_account():
    current_user_id = get_jwt_identity()
    user = User.get_user_by_id(current_user_id)
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
@app.route('/new_recipe', methods=['POST'])
@jwt_required()
def new_recipe():
    data = request.json
    current_user_id = get_jwt_identity()
    user = User.get_user_by_id(current_user_id)
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

@app.route('/delete_recipe', methods=['DELETE'])
@jwt_required()
def delete_recipe():
    current_user_id = get_jwt_identity()
    user = User.get_user_by_id(current_user_id)
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
@app.route('/users', methods=['GET'])
def users():
    users = User.query.all()
    users_data = [user.to_dict() for user in users]
    return jsonify(users_data), 200

@app.route('/recipes', methods=['GET'])
def recipes():
    recipes = Recipe.query.all()
    recipes_data = [recipe.to_dict() for recipe in recipes]
    return jsonify(recipes_data), 200




with app.app_context():
    db.create_all()

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

