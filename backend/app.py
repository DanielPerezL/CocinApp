from config import *
from flask import Flask, jsonify, request, send_from_directory
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import *
from endpoints import *

'''@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

# Ruta para servir cualquier recurso estático (CSS, JS, imágenes)
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')'''


with app.app_context():
    db.create_all()

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

