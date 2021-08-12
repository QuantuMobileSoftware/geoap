#!/bin/sh
docker build -f Dockerfile -t example_jupyter .
docker run -d -p 8847:8888 -v /home/quantum/sip:/home/jovyan/work \
  -e JUPYTER_ENABLE_LAB=yes --restart always --name example_jupyter_1 example_jupyter:latest \
  start-notebook.sh --NotebookApp.password='sha1:c13a1700f710:d5735a5cc1d95e9f8e8ae6691b6e647d38e3d852'
