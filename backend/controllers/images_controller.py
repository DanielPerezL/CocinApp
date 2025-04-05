from config import app
from flask import make_response, request, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt
from utils import get_user_from_token
from exceptions import NotFoundException, BadRequestException
from services import ImagesService

@app.route('/api/images/<path:filename>', methods=['GET'])
def serve_uploaded_file(filename):
    filename = ImagesService.get_image(filename)
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/images', methods=['POST'])
@jwt_required()
def upload_image():
    user = get_user_from_token(get_jwt())    
    if user is None:
        raise NotFoundException()
    
    if 'image' not in request.files:
        raise BadRequestException()
    
    image = request.files['image']
    
    if image.filename == '':
        raise BadRequestException()

    new_filename = ImagesService.save_image(user, image)

    # Devolver respuesta con la cabecera Location
    response = make_response()
    response.status_code = 204

    base_url = request.host_url.rstrip('/')
    response.headers["Location"] = f"{base_url}/api/images/{new_filename}"
    
    return response
