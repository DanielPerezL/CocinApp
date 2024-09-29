#!/bin/bash

# Detiene y elimina los contenedores, redes y volúmenes definidos en el archivo docker-compose
sudo docker-compose down --volumes 

# Inicia el servicio mysql_db en segundo plano
sudo docker-compose up --build -d mysql

# Construye las imágenes sin usar la caché
sudo docker-compose build --no-cache 

# Inicia el servicio backend y se adjunta a la terminal
sudo docker-compose up backend

sudo docker-compose stop 

