from config import app, db
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from models import *
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_token
from utils import delete_images_by_filenames, hasPermission
from errors import noPermissionError, noRequestedInfoError, userNotFoundError, recipeNotFoundError

@app.route('/api/reports', methods=['GET', 'POST'])
def reports():
    method = request.method
    if method == 'GET':
        reports = Report.query.all()
        report_data = [report.to_simple_dto() for report in reports]
        return jsonify(report_data), 200
    if method == 'POST':
        return handle_report(request.get_json())
    
def handle_report(data):
    if not data or not all(key in data for key in ('reported_resource',)):
        return noRequestedInfoError()
    reported_resource = data.get("reported_resource")
    report = Report.query.filter_by(reported_resource=reported_resource).first()
    if report is not None:
        report.increment_count()
        try:
            db.session.commit()
            return jsonify({"msg": "Reporte enviado correctamente."}), 201
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({"error": "Error al enviar el reporte. Inténtelo de nuevo más tarde."}), 400
    
    new_report = Report(reported_resource=reported_resource)
    try:
        db.session.add(new_report)
        db.session.commit()
        return jsonify({"msg": "Reporte enviado correctamente."}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al enviar el reporte. Inténtelo de nuevo más tarde."}), 400
