from config import *
from flask import Flask, jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import *

from endpoints import *

@app.route('/api/users', methods=['GET'])
def users():
    users = User.query.all()
    users_data = [user.to_dict() for user in users]
    return jsonify(users_data), 200

@app.route('/api/recipes', methods=['GET'])
def recipes():
    recipes = Recipe.query.all()
    recipes_data = [recipe.to_dict() for recipe in recipes]
    return jsonify(recipes_data), 200

with app.app_context():
    db.create_all()

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

