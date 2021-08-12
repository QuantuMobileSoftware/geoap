#!/bin/sh
docker build -f Dockerfile -t pw_nvidia_jupyter .
docker run -d --shm-size=1g --gpus device=0 -p 8888:8888 -v /mnt/disk1:/mnt/disk1 -v /home/quantum/sip:/home/jovyan/work \
  -e JUPYTER_ENABLE_LAB=yes -e NVIDIA_DRIVER_CAPABILITIES=all --restart always \
  --name pw_nvidia_jupyter_1 pw_nvidia_jupyter:latest