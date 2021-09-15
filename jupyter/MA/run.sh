#!/bin/sh

docker build -f prod.Dockerfile -t ma_nvidia_jupyter .
docker run -d --shm-size=1g --gpus device=0 -p 8853:8888 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes -e NVIDIA_DRIVER_CAPABILITIES=all --restart always --name ma_nvidia_jupyter_1 ma_nvidia_jupyter:latest
