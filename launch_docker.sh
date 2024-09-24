#!/bin/bash

sudo docker-compose stop
sudo docker-compose rm -f backend
sudo docker-compose build --no-cache backend
sudo docker-compose up backend mysql