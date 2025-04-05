from config import app
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from models import Report
from utils import get_user_from_token
from utils import is_admin
from exceptions import ForbiddenException, BadRequestException, NotFoundException
from services import ReportsService

@app.route('/api/reports', methods=['GET'])
@jwt_required()
def reports():
    client = get_user_from_token(get_jwt())  
    if not is_admin(client):
        raise ForbiddenException() 
    return jsonify(ReportsService.get_reports()), 200
   
@app.route('/api/reports', methods=['POST'])
def handle_report():
    data = request.get_json()
    if not data or not all(key in data for key in ('reported_resource',)):
        raise BadRequestException()
    reported_resource = data.get("reported_resource")
    ReportsService.report_resource(reported_resource)
    return '', 204

@app.route('/api/reports/<int:id>', methods=['PUT'])
@jwt_required()
def review_report(id):
    client = get_user_from_token(get_jwt())  

    if not is_admin(client):
        raise ForbiddenException() 
    
    report = Report.query.get(id)
    if report is None:
        raise NotFoundException()
    
    ReportsService.review_report(report)
    return '', 204