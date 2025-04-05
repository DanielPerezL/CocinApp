from models import Image
from config import app, IMG_BACKUP
import os
from utils import get_new_image_name
from exceptions import AppException, NotFoundException

class ImagesService():

    @staticmethod
    def save_image(user, image):
        new_filename = get_new_image_name(user, image)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)

        # Hacer copia en BD
        if IMG_BACKUP:
            image_data = image.read()
            image.seek(0)

            new_image = Image.store_image(filename=new_filename, binary_data=image_data)
            if not new_image:
                raise AppException()

        # Guardar el volumen Docker
        image.save(filepath)
        return new_filename
    
    @staticmethod
    def get_image(filename):
        # Verifica si el archivo existe en el directorio de subida
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.isfile(file_path):
            return filename
        
        if IMG_BACKUP:
            # Buscar en la bd
            image = Image.query.filter_by(filename=filename).first()
            if image:
                # Restaurar archivo a volumen docker y enviar imagen
                with open(file_path, 'wb') as f:
                    f.write(image.binary_data)
                return filename
            
        raise NotFoundException()

