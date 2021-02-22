#!/bin/sh
docker build -f prod.Dockerfile -t pbdnn_nvidia_jupyter .
docker run -d --shm-size=1g --gpus all -p 8850:8888 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes -e NVIDIA_DRIVER_CAPABILITIES=all --restart always --name pbdnn_nvidia_jupyter_1 pbdnn_nvidia_jupyter:latest