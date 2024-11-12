#!/bin/bash
#DA ERROR LA PRIMERA EJECUCION por eso vuelve a llamar a launch_docker
# Detiene y elimina los contenedores, redes y volúmenes definidos en el archivo docker-compose
docker-compose down --volumes 

# Inicia el servicio mysql_db en segundo plano
docker-compose up --build -d mysql

# Construye las imágenes sin usar la caché
docker-compose build --no-cache 

# Inicia el servicio backend y se adjunta a la terminal
docker-compose up backend

docker-compose stop 
