from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import *
import os
import re
from config import app


def get_user_from_token(decoded_token):
    identity = decoded_token.get("sub")  # La identidad del usuario (el id)
    #password_hash = decoded_token.get("password_hash")  # Datos adicionales

    if not identity:
        return None

    # Busca al usuario en la base de datos
    user = User.query.get(identity)
    if user is None:
        return None
    return user
    
def create_tokens(user):
    access_token = create_access_token(identity=str(user.id),  # identity debe ser un string o entero
                                       #additional_claims={"password_hash": user.password_hash}
    )
    refresh_token = create_refresh_token(identity=str(user.id),  # identity debe ser un string o entero
                                         #additional_claims={"password_hash": user.password_hash}
    )
    return access_token, refresh_token                                   

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
