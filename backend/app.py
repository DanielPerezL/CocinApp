from config import *
from flask import jsonify, request, send_from_directory
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, set_access_cookies
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import *
from endpoints import *
from time import sleep

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
    user = User.query.get(get_jwt_identity())
    if user is None:
        return jsonify({"error": "Token inválido"}), 401
    new_access_token, _ = create_tokens(user)
    resp = jsonify({'refresh': True})
    set_access_cookies(resp, new_access_token, max_age=app.config['JWT_REFRESH_TOKEN_EXPIRES'])
    return resp, 200

with app.app_context():
    db.create_all()
    admin = User.query.filter_by(nickname=os.environ['ADMIN_USER']).first()
    if admin is not None and not admin.check_password(os.environ['ADMIN_PASSWORD']):
        admin.set_password(os.environ['ADMIN_PASSWORD'])
        try:
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
    elif admin is None:
        new_admin = User(nickname = os.environ['ADMIN_USER'],
                    email = os.environ['ADMIN_USER'],
                    password = os.environ['ADMIN_PASSWORD']
                    )
        try:
            db.session.add(new_admin)
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
    
# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

