from config import *
from flask import Flask, jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User



# Rutas y funciones
@app.route('/register', methods=['POST'])
def register():
    data = request.json

    if not data['nickname'] or not data['email'] or not data['password']:
        return jsonify({"msg": "Get sure to provide all requested data"}), 400

    nickname = data.get('nickname')
    email = data.get('email')
    password = data.get('password')


    if User.query.filter_by(email=email).first() is not None:
        return jsonify({"msg": "Email already registered"}), 400

    hashed_password = generate_password_hash(password, method='sha256')

    new_user = User(nickname=nickname, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user is None or not check_password_hash(user.password, password):
        return jsonify({"msg": "Bad email or password"}), 401

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify(access_token=access_token, refresh_token=refresh_token), 200
    

@app.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    user = User.query.get(current_user['id'])
    if user is None:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "nickname": user.nickname,
        "email": user.email,
    }), 200

@app.route('/users', methods=['GET'])
def users():
    users = User.query.all()
    users_data = [user.to_dict() for user in users]
    return jsonify(users_data), 200


# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

