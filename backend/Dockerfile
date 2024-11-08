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
CMD ["gunicorn", "-w 8","--bind", "0.0.0.0:5000", "app:app", "--access-logfile", "-", "--error-logfile", "-"]
