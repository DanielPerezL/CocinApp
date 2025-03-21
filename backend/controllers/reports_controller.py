from config import app, db, REPORT_QUERY_LIMIT
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from models import *
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError
from utils import get_user_from_token
from utils import is_admin
from errors import *

@app.route('/api/reports', methods=['GET'])
@jwt_required()
def reports():
    client = get_user_from_token(get_jwt())  
    
    if not is_admin(client):
        return no_permission_error() 
    reports = Report.query.order_by(desc(Report.count)) \
                .filter(Report.reviewed == False) \
                .limit(REPORT_QUERY_LIMIT).all()
    report_data = [report.to_dto() for report in reports]
    return jsonify(report_data), 200
   
@app.route('/api/reports', methods=['POST'])
def handle_report():
    data = request.get_json()
    if not data or not all(key in data for key in ('reported_resource',)):
        return no_requested_info_error()
    reported_resource = data.get("reported_resource")
    report = Report.query.filter_by(reported_resource=reported_resource).first()
    if report is not None:
        status = report.increment_count()
        if status:
            return '', 204
        else:
            return send_report_error()
    
    new_report = Report.store_report(reported_resource=reported_resource)
    if not new_report:
        return send_report_error()
    return '', 204

@app.route('/api/reports/<int:id>', methods=['PUT'])
@jwt_required()
def review_report(id):
    client = get_user_from_token(get_jwt())  

    if not is_admin(client):
        return no_permission_error() 
    
    report = Report.query.get(id)
    if report is None:
        return report_not_found_error()
    
    status = report.set_reviewed()
    if not status:
        return unexpected_error()
    return '', 204