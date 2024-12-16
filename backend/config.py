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
CORS(app, supports_credentials=True, origins=['*']) #añadir dominio origins=[] para prod

UPLOAD_FOLDER = '/cocinapp/uploads'
os.environ['ADMIN_USER'] = "CocinApp"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{os.environ['DATABASE_USER']}:{os.environ['DATABASE_PASSWORD']}@{os.environ['DATABASE_HOST']}/{os.environ['DATABASE_NAME']}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['JWT_SECRET_KEY'] = os.environ['JWT_SECRET_KEY'] 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=60)

app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_COOKIE_PATH'] = '/api/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/token/refresh'
app.config['JWT_COOKIE_CSRF_PROTECT'] = True 
app.config['JWT_CSRF_METHODS'] = ["POST", "PUT", "DELETE"]


#cambiar para PROD
app.config['JWT_COOKIE_SECURE'] = True

time.sleep(3)
jwt = JWTManager(app)
db = SQLAlchemy(app)

# Manejo de errores de base de datos
@app.errorhandler(OperationalError)
def handle_db_error(error):
    return jsonify({"msg": "Database connection error"}), 500