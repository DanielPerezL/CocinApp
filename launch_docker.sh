#!/bin/bash

# Detiene todos los servicios
docker-compose stop 

# Elimina el contenedor del servicio backend
docker-compose rm -f backend 

# Construye la imagen del servicio backend (usando la caché)
docker-compose build backend 

# Inicia el servicio mysql en segundo plano
docker-compose up --remove-orphans -d mysql 

# Inicia el servicio backend y se adjunta a la terminal
docker-compose up backend

docker-compose stop 
