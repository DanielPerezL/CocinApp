#!/bin/bash

# Detiene todos los servicios
sudo docker-compose stop 

# Elimina el contenedor del servicio backend
sudo docker-compose rm -f backend 

# Construye la imagen del servicio backend (usando la caché)
sudo docker-compose build backend 

# Inicia el servicio mysql en segundo plano
sudo docker-compose up -d mysql 

# Inicia el servicio backend y se adjunta a la terminal
sudo docker-compose up backend

sudo docker-compose stop 
