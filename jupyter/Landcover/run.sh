#!/bin/sh
docker build -f Dockerfile -t landcover .
docker run -d -p 8856:8888 -v /home/ec2-user/data:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes --restart always --name landcover_1 landcover:latest
