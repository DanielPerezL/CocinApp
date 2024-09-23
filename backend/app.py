import config
import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import OperationalError
from models import db, User

# Inicializar Flask, JWT y SQLAlchemy
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{os.environ['DATABASE_USER']}:{os.environ['DATABASE_PASSWORD']}@{os.environ['DATABASE_HOST']}/{os.environ['DATABASE_NAME']}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ['JWT_SECRET_KEY']  # Cambia esto a una clave secreta real
jwt = JWTManager(app)
db.init_app(app)

with app.app_context():
    db.create_all()

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

    access_token = create_access_token(identity={"id": user.id, "nickname": user.nickname})
    return jsonify(access_token=access_token), 200

'''@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # No se necesita ninguna acción específica para el logout con JWT
    return jsonify({"msg": "Logout successful"}), 200'''

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


# Manejo de errores de base de datos
@app.errorhandler(OperationalError)
def handle_db_error(error):
    return jsonify({"msg": "Database connection error"}), 500

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

