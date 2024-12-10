from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import *
import os
import re
from config import app
from flask import current_app
import hashlib
from datetime import datetime

#Comprobar permisos
def hasPermission(user, resource):
    if user is None:
        return False
    elif isAdmin(user):
        return True
    elif isinstance(resource, User):
        # Lógica para verificar permisos sobre un User
        return resource.id == user.id
    elif isinstance(resource, Recipe):
        # Lógica para verificar permisos sobre un Recipe
        return resource.user_id == user.id
    else:
        # Manejo de error o lógica para tipos desconocidos
        return False

def isAdmin(user):
    return user.nickname == os.environ['ADMIN_USER']

#MANEJO DE TOKENS
#CREACION    
def create_tokens(user):
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return access_token, refresh_token                                   

#CONSULTA
def get_user_from_token(decoded_token):
    identity = decoded_token.get("sub")  # La identidad del usuario (el id)
    if not identity:
        return None
    # Busca al usuario en la base de datos
    user = User.query.get(identity)
    if user is None:
        return None
    return user 

#MANEJO DE IMAGENES
#CREACION
def get_new_image_name(user, image):
    image_content = image.read()
    image_hash = hashlib.sha256(image_content).hexdigest()
    image.seek(0)

    # Obtiene la extensión del archivo original
    _, extension = os.path.splitext(image.filename)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # Crea un nuevo nombre de archivo basado en el hash
    new_filename = f"{user.id}_{timestamp}_{image_hash}{extension}"
    return new_filename

#BORRADO
def delete_images_by_uploader(user):
    delete_images_by_pattern(f"{user.id}_.*")

#BORRADO
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

#BORRADO    
def delete_images_by_filenames(filenames_str):
    upload_folder = current_app.config['UPLOAD_FOLDER']
    filenames = [filename.strip() for filename in filenames_str.split(",")]

    for filename in filenames:
        filepath = os.path.join(upload_folder, filename)
        if os.path.exists(filepath):
            os.remove(filepath)  # Elimina el archivo
    return
