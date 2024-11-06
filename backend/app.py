from config import *
from flask import jsonify, request, send_from_directory
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, set_access_cookies
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import *
from endpoints import *

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.errorhandler(404)
def not_found(e):
        return send_from_directory(app.static_folder, "index.html")

@app.route('/token/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_access_token():
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"error": "Token inválido"}), 401
    new_access_token = create_access_token(identity = {"id": user.id, 
                                                       "password_hash": user.password_hash,
                                                       })
    resp = jsonify({'refresh': True})
    set_access_cookies(resp, new_access_token)
    return resp, 200

with app.app_context():
    db.create_all()

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

