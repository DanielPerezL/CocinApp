import time
from datetime import timedelta
import os
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from sqlalchemy.exc import OperationalError

# Inicializar Flask, SQLAlchemy y JWT
app = Flask(__name__, static_folder='./static')
CORS(app, supports_credentials=True) #eliminar para prod

UPLOAD_FOLDER = '/cocinapp/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{os.environ['DATABASE_USER']}:{os.environ['DATABASE_PASSWORD']}@{os.environ['DATABASE_HOST']}/{os.environ['DATABASE_NAME']}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['JWT_SECRET_KEY'] = os.environ['JWT_SECRET_KEY'] 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(minutes=1)

app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
app.config['JWT_ACCESS_COOKIE_NAME'] = 'access_token_cookie'  # Este nombre no será usado, pero es necesario
app.config['JWT_REFRESH_COOKIE_NAME'] = 'refresh_token_cookie'  # Nombre de la cookie para el refresh token

app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Configura como True si deseas protección CSRF para cookies


jwt = JWTManager(app)
db = SQLAlchemy(app)

# Manejo de errores de base de datos
@app.errorhandler(OperationalError)
def handle_db_error(error):
    return jsonify({"msg": "Database connection error"}), 500