from config import db

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    reported_resource = db.Column(db.String(255), nullable=False, unique=True)  # Identificador único del recurso reportado
    count = db.Column(db.Integer, default=1, nullable=False)  # Contador de reportes, inicia en 1
    reviewed = db.Column(db.Boolean, default=False, nullable=False)  # Estado de revisión, inicia en False

    def __init__(self, reported_resource):
        self.reported_resource = reported_resource

    def increment_count(self):
        self.count += 1
        #POR SI YA SE REVISÓ, QUE VUELVA A REVISARSE (por posibles cambios en los recursos)
        self.reviewed = False

    def set_reviewed(self):
        self.reviewed = True

    def to_dto(self):
        #Report DTO
        return {
            'id': self.id,
            'reported_resource': self.reported_resource,
            'count': self.count,
            'reviewed': self.reviewed,
        }