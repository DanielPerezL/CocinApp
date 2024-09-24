import time
from datetime import timedelta
import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from sqlalchemy.exc import OperationalError


time.sleep(20) #Para asegurar que la BD se despliega correctamente
# Inicializar Flask, SQLAlchemy y JWT
app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{os.environ['DATABASE_USER']}:{os.environ['DATABASE_PASSWORD']}@{os.environ['DATABASE_HOST']}/{os.environ['DATABASE_NAME']}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['JWT_SECRET_KEY'] = os.environ['JWT_SECRET_KEY'] 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

jwt = JWTManager(app)
db = SQLAlchemy(app)

# Manejo de errores de base de datos
@app.errorhandler(OperationalError)
def handle_db_error(error):
    return jsonify({"msg": "Database connection error"}), 500
