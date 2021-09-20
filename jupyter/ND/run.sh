#!/bin/sh
docker build -f prod.Dockerfile -t nd_nvidia_jupyter .
docker run -d --shm-size=1g --gpus device=0 -p 8854:8888 -v /mnt/disk1:/mnt/disk1 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes -e NVIDIA_DRIVER_CAPABILITIES=all --restart always --name nd_nvidia_jupyter_1 nd_nvidia_jupyter:latest