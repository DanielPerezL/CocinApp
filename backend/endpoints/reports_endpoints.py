from config import app, db
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, verify_jwt_in_request
from models import *
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_token
from utils import hasPermission
from errors import noPermissionError, noRequestedInfoError, userNotFoundError, recipeNotFoundError, reportNotFoundError

REPORT_QUERY_LIMIT = 50

@app.route('/api/reports', methods=['GET', 'POST'])
#@jwt_required(optional=True)
def reports():
    method = request.method
    if method == 'GET':
        try:
            verify_jwt_in_request() 
        except Exception as e:
            return jsonify({"error": "Authentication required or invalid token"}), 401
        client = get_user_from_token(get_jwt())  
        
        #SI CLIENT ES ADMIN TENDRA PERMISOS  
        if not hasPermission(client, Report):
            return noPermissionError() 
        reports = Report.query.order_by(desc(Report.count)) \
                    .filter(Report.reviewed == False) \
                    .limit(REPORT_QUERY_LIMIT).all()
        report_data = [report.to_dto() for report in reports]
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

@app.route('/api/reports/<int:id>', methods=['PUT'])
@jwt_required()
def review_report(id):
    client = get_user_from_token(get_jwt())  
    #SI CLIENT ES ADMIN TENDRA PERMISOS  
    if not hasPermission(client, Report):
        return noPermissionError() 
    
    report = Report.query.get(id)
    if report is None:
        return reportNotFoundError()
    
    report.set_reviewed()
    try:
        db.session.commit()
        return jsonify({"msg": "Reporte revisado correctamente."}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
    return jsonify({"error": "Ha ocurrido un error inesperado. Inténtelo de nuevo más tarde."}), 400

    
