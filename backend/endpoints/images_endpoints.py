from config import app, db, IMG_BACKUP
from flask import make_response, request, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt
import os
from utils import get_user_from_token, get_new_image_name, delete_image
from errors import *
from models import Image

@app.route('/api/images/<path:filename>', methods=['GET'])
def serve_uploaded_file(filename):
    # Verifica si el archivo existe en el directorio de subida
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.isfile(file_path):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    if IMG_BACKUP:
        # Buscar en la bd
        image = Image.query.filter_by(filename=filename).first()
        if image:
            # Restaurar archivo a volumen docker y enviar imagen
            with open(file_path, 'wb') as f:
                f.write(image.binary_data)
            return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
        
    return image_not_found_error()

@app.route('/api/images', methods=['POST'])
@jwt_required()
def upload_image():
    user = get_user_from_token(get_jwt())    
    if user is None:
        return user_not_found_error()
    
    if 'image' not in request.files:
        return no_requested_info_error()
    
    image = request.files['image']
    
    if image.filename == '':
        return no_requested_info_error()

    # Preparar ruta
    new_filename = get_new_image_name(user, image)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)

    # Hacer copia en BD
    if IMG_BACKUP:
        image_data = image.read()
        image.seek(0)

        new_image = Image(filename=new_filename, binary_data=image_data)
        try:
            db.session.add(new_image)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return unexpected_error()

    # Guardar el volumen Docker
    image.save(filepath)

    # Devolver respuesta con la cabecera Location
    response = make_response()
    response.status_code = 204

    base_url = request.host_url.rstrip('/')
    response.headers["Location"] = f"{base_url}/api/images/{new_filename}"
    
    return response
