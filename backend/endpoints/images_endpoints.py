from config import app
from flask import jsonify, request, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt
import hashlib
import os
from utils import get_user_from_token
from datetime import datetime


@app.route('/api/images/<path:filename>', methods=['GET'])
def serve_uploaded_file(filename):
    # Verifica si el archivo existe en el directorio de subida
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.isfile(file_path):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    return jsonify({"error": "Image not found"}), 404

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_image():
    user = get_user_from_token(get_jwt())    
    if user is None:
        return jsonify({"error": "Usuario no encontrado."}), 404
    
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image = request.files['image']
    
    if image.filename == '':
        return jsonify({"error": "No image selected"}), 400

    # Lee el contenido de la imagen para generar un hash
    image_content = image.read()
    image_hash = hashlib.sha256(image_content).hexdigest()
    
    # Obtiene la extensión del archivo original
    _, extension = os.path.splitext(image.filename)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # Crea un nuevo nombre de archivo basado en el hash
    new_filename = f"{user.id}_{timestamp}_{image_hash}{extension}"
    
    # Construye la ruta completa donde se almacenará el archivo
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)

    # Guarda la imagen (vuelve a colocar el puntero al inicio antes de guardar)
    image.seek(0)
    image.save(filepath)

    return jsonify({"msg": "Image uploaded successfully", "filename": new_filename}), 200
