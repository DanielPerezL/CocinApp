from config import db
from sqlalchemy.dialects.mysql import LONGBLOB


class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False, unique=True)
    binary_data = db.Column(LONGBLOB, nullable=False)

    def __init__(self, filename, binary_data):
        self.filename = filename
        self.binary_data = binary_data

    @staticmethod
    def store_image(filename, binary_data):
        new_image = Image(filename=filename, binary_data=binary_data)
        try:
            db.session.add(new_image)
            db.session.commit()
            return new_image
        except Exception:
            db.session.rollback()
            return None 