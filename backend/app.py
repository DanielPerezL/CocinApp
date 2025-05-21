from config import *
from flask import send_from_directory
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import *
from controllers import (
    auth_controller,
    images_controller,
    recipes_controller,
    reports_controller,
    user_controller,
)
from exceptions import AppException

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.errorhandler(404)
def not_found(e):
        return send_from_directory(app.static_folder, "index.html")

@app.errorhandler(AppException)
def handle_app_exception(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

@app.errorhandler(SQLAlchemyError)
def handle_sqlalchemy_error(error):
    response = jsonify({
        "error": "database_error",
        "message": "Error en la base de datos."
    })
    response.status_code = 500
    return response

@app.errorhandler(Exception)
def handle_unexpected_error(error):
    response = jsonify({
        "error": "unexpected_error",
        "message": str(error)
    })
    response.status_code = 500
    return response

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
    app.run(host='0.0.0.0', port=SERVER_PORT)

