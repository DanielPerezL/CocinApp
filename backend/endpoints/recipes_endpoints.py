from config import app, db
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_identity

@app.route('/api/new_recipe', methods=['POST'])
@jwt_required()
def new_recipe():
    data = request.json
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"msg": "User not found"}), 404
    
    new_recipe = Recipe(title = data.get('title'),
                        user_id = user.id,
                        ingredients = data.get('ingredients'),
                        procedure = data.get('procedure'),
                        )
    try:
        db.session.add(new_recipe)
        db.session.commit()
        return jsonify({"msg": "Recipe uploaded successfully"}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
    return jsonify({"msg": "Get sure to provide all requested data"}), 400

@app.route('/api/delete_recipe', methods=['DELETE'])
@jwt_required()
def delete_recipe():
    user = get_user_from_identity(get_jwt_identity())
    if user is None:
        return jsonify({"msg": "User not found"}), 404
    
    data = request.json
    recipe = Recipe.query.get(data.get('recipe_id'))
    if recipe is None:
        return jsonify({"msg": "Recipe not found"}), 404
    try:
        db.session.delete(recipe)
        db.session.commit()
        return 204
    except SQLAlchemyError as e:
        db.session.rollback()
    return jsonify({"msg": "Unexpected error occurred"}), 500
