from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import *
import os
import re
from config import app


#Devuele un objeto de clase User o None
def get_user_from_identity(identity):
    if identity is None:
        return None
    user = User.query.get(identity.get("id"))
    if user is None or user.password_hash!=identity.get("password_hash"):
        return None
    return user
    
def delete_images_by_pattern(pattern):
    upload_folder = app.config['UPLOAD_FOLDER']

    # Compila la expresión regular
    regex = re.compile(pattern)

    # Recorre los archivos en el directorio de subida
    for filename in os.listdir(upload_folder):
        # Verifica si el nombre del archivo coincide con la expresión regular
        if regex.match(filename):
            filepath = os.path.join(upload_folder, filename)
            os.remove(filepath)  # Elimina el archivo

def delete_images_by_pattern(pattern):
    upload_folder = app.config['UPLOAD_FOLDER']

    # Compila la expresión regular
    regex = re.compile(pattern)

    # Recorre los archivos en el directorio de subida
    for filename in os.listdir(upload_folder):
        # Verifica si el nombre del archivo coincide con la expresión regular
        if regex.match(filename):
            filepath = os.path.join(upload_folder, filename)
            os.remove(filepath)  # Elimina el archivo
    
import os
from flask import current_app

def delete_images_by_filenames(filenames_str):
    upload_folder = current_app.config['UPLOAD_FOLDER']
    filenames = [filename.strip() for filename in filenames_str.split(",")]

    for filename in filenames:
        filepath = os.path.join(upload_folder, filename)
        if os.path.exists(filepath):
            os.remove(filepath)  # Elimina el archivo
    return
