from datetime import timedelta
import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from sqlalchemy.exc import OperationalError

# Inicializar Flask, SQLAlchemy y JWT
app = Flask(__name__, static_folder='./static')

#Definidir dominio para prod
CORS(app, supports_credentials=True, origins=["master-stinkbug-slowly.ngrok-free.app"]) 

UPLOAD_FOLDER = '/cocinapp/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{os.environ['DATABASE_USER']}:{os.environ['DATABASE_PASSWORD']}@{os.environ['DATABASE_HOST']}/{os.environ['DATABASE_NAME']}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ['JWT_SECRET_KEY'] 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=2)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=90)
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_COOKIE_PATH'] = '/api/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/token/refresh'
app.config['JWT_CSRF_METHODS'] = ["POST", "PUT", "DELETE"]
app.config['JWT_COOKIE_CSRF_PROTECT'] = True 
app.config['JWT_COOKIE_SECURE'] = True

RECIPE_CART_SIZE = 10
NICKNAME_MAX_LENGTH = 20
REPORT_QUERY_LIMIT = 20

jwt = JWTManager(app)
db = SQLAlchemy(app)

# Manejo de errores de base de datos
@app.errorhandler(OperationalError)
def handle_db_error(error):
    return jsonify({"msg": "Database connection error"}), 500