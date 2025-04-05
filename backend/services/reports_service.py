from models import Report
from config import REPORT_QUERY_LIMIT
from sqlalchemy import desc
from exceptions import AppException

class ReportsService():
    
    @staticmethod
    def get_reports():
        reports = Report.query.order_by(desc(Report.count)) \
                .filter(Report.reviewed == False) \
                .limit(REPORT_QUERY_LIMIT).all()
        return [report.to_dto() for report in reports]

    @staticmethod
    def report_resource(reported_resource):
        report = Report.query.filter_by(reported_resource=reported_resource).first()
        if report is not None:
            status = report.increment_count()
            if not status:
                raise AppException()
        
        else:
            new_report = Report.store_report(reported_resource=reported_resource)
            if not new_report:
                raise AppException()

    @staticmethod
    def review_report(report):
        status = report.set_reviewed()
        if not status:
            raise AppException()