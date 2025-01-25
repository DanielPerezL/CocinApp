from config import app
from flask import jsonify, request, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt
import os
from utils import get_user_from_token, get_new_image_name
from errors import *

@app.route('/api/images/<path:filename>', methods=['GET'])
def serve_uploaded_file(filename):
    # Verifica si el archivo existe en el directorio de subida
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.isfile(file_path):
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

    new_filename = get_new_image_name(user, image)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
    image.save(filepath)

    return jsonify({"msg": "Imagen publicada con éxito", "filename": new_filename}), 200
