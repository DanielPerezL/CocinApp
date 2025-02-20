from flask_jwt_extended import create_access_token, create_refresh_token
from models import *
import os
import re
from config import app, db, IMG_BACKUP
from flask import current_app
import hashlib
from datetime import datetime

#Comprobar permisos
def has_permission(user, resource):
    if user is None:
        return False
    elif is_admin(user):
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

def is_admin(user):
    return user.nickname == os.environ['ADMIN_USER']

def has_more_results(query, offset, limit):
    return query.offset(offset + limit).first() is not None

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
    # Compila la expresión regular
    regex = re.compile(pattern)
    
    upload_folder = app.config['UPLOAD_FOLDER']
    file_list = set(os.listdir(upload_folder))
    if IMG_BACKUP:
        db_filenames = set(image.filename for image in Image.query.all())
        file_list = file_list.union(db_filenames)
    
    for filename in file_list:
        # Verifica si el nombre del archivo coincide con la expresión regular
        if regex.match(filename):
            delete_image(filename)


#BORRADO    
def delete_images_by_filenames(filenames):
    for filename in filenames:
        delete_image(filename)
    return

def delete_image(filename):
    if filename == "":
        return
    
    upload_folder = current_app.config['UPLOAD_FOLDER']
    filepath = os.path.join(upload_folder, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    if IMG_BACKUP:
        image = Image.query.filter_by(filename=filename).first()
        if image:
            try:
                db.session.delete(image)
                db.session.commit()
            except:
                db.session.rollback()