#!/bin/sh
docker build -f prod.Dockerfile -t ce_nvidia_jupyter .
docker run -d --shm-size=1g --gpus all -p 8855:8888 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes -e NVIDIA_DRIVER_CAPABILITIES=all --restart always --name ce_nvidia_jupyter_1 ce_nvidia_jupyter:latest