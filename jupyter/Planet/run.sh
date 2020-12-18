#!/bin/sh
docker build -f Dockerfile -t planet_jupyter .
docker run -d -p 8849:8888 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes --restart always --name planet_jupyter_1 planet_jupyter:latest
