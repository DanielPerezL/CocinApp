# Usa una imagen de Python
#FROM python:3.9-slim

# Establece el directorio de trabajo dentro del contenedor
#WORKDIR /app

# Copia el archivo de dependencias a la imagen y luego instálalas
#COPY requirements.txt .
#RUN pip install --no-cache-dir -r requirements.txt

# Copia el código fuente de la aplicación
#COPY . .

# Expone el puerto 5000 para Flask
#EXPOSE 5000

# Comando para ejecutar la aplicación
#CMD ["python", "app.py"]

# Usa una imagen base de Python
FROM python:3.9-slim

# Configura el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY . .

# Expone el puerto en el que la app estará corriendo
EXPOSE 5000

# Comando para ejecutar la aplicación con Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app", "--access-logfile", "-", "--error-logfile", "-"]
