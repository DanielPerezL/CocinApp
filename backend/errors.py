from flask import jsonify


def noPermissionError():
    return jsonify({"error": "No tienes los permisos necesarios."}), 403

def noRequestedInfoError():
    return jsonify({"error": "Asegurate de introducir toda la información necesaria"}), 400

def userNotFoundError():
    return jsonify({"error": "Usuario no encontrado."}), 404

def recipeNotFoundError():
    return jsonify({"error": "Receta no encontrada."}), 404

def reportNotFoundError():
    return jsonify({"error": "Reporte no encontrado."}), 404

def noRecipeUploadedError():
    return jsonify({"error": "Error al publicar la receta. Inténtelo de nuevo más tarde."}), 400

def noValidIdProvided():
    return jsonify({"error": "El id proporcionado no es válido"}), 404

def unexpectedError():
    return jsonify({"error": "Ha ocurrido un error inesperado. Inténtelo de nuevo más tarde."}), 400