#!/bin/sh
docker build -f Dockerfile -t multiobject_yolo_jupyter .
docker run -d --shm-size=1g --gpus device=0  -p 8846:8888 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes -e NVIDIA_DRIVER_CAPABILITIES=all --restart always --name multiobject_yolo_jupyter_1 multiobject_yolo_jupyter:latest
