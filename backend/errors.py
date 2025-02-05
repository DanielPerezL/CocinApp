from flask import jsonify


def user_not_found_error():
    return jsonify({"error": "Usuario no encontrado."}), 404

def user_already_exists_email():
    return jsonify({"error": "Ya existe una cuenta asociada a ese email."}), 400

def user_already_exists_nickname():
        return jsonify({"error": "Ya existe una cuenta asociada con ese nombre de usuario."}), 400

def user_nick_too_long():
    return jsonify({"error": "El nombre de usuario excede el tamaño permitido."}), 400

def recipe_not_found_error():
    return jsonify({"error": "Receta no encontrada."}), 404

def no_recipe_uploaded_error():
    return jsonify({"error": "Error al publicar la receta. Inténtelo de nuevo más tarde."}), 400

def report_not_found_error():
    return jsonify({"error": "Reporte no encontrado."}), 404

def send_report_error():
    return jsonify({"error": "Error al enviar el reporte. Inténtelo de nuevo más tarde."}), 400

def image_not_found_error():
    return jsonify({"error": "Imagen no encontrada."}), 404

def no_requested_info_error():
    return jsonify({"error": "Asegurate de introducir toda la información necesaria"}), 400

def no_permission_error():
    return jsonify({"error": "No tienes los permisos necesarios."}), 403

def no_valid_id_provided():
    return jsonify({"error": "El id proporcionado no es válido"}), 404

def invalid_token():
    return jsonify({"error": "Autenticación requerida o token inválido"}), 401    

def unexpected_error():
    return jsonify({"error": "Ha ocurrido un error inesperado. Inténtelo de nuevo más tarde."}), 400
