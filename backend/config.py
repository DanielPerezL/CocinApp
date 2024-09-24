import time
import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from sqlalchemy.exc import OperationalError
from models import db, User

time.sleep(20) #Para asegurar que la BD se despliega correctamente

# Inicializar Flask, JWT y SQLAlchemy
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{os.environ['DATABASE_USER']}:{os.environ['DATABASE_PASSWORD']}@{os.environ['DATABASE_HOST']}/{os.environ['DATABASE_NAME']}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ['JWT_SECRET_KEY']  # Cambia esto a una clave secreta real
jwt = JWTManager(app)
db.init_app(app)

with app.app_context():
    db.create_all()

# Manejo de errores de base de datos
@app.errorhandler(OperationalError)
def handle_db_error(error):
    return jsonify({"msg": "Database connection error"}), 500
