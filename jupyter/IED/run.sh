#!/bin/sh
docker build -f prod.Dockerfile -t ied_nvidia_jupyter .
docker run -d --gpus all -p 8880:8880 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes -e NVIDIA_DRIVER_CAPABILITIES=all --restart always --name ied_nvidia_jupyter_1 ied_nvidia_jupyter:latest