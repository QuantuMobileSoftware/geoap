#!/bin/sh
docker build -f Dockerfile -t pbd_jupyter .
# docker run -d -p 8848:8888 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes --restart always --name pbd_jupyter_1 pbd_jupyter:latest
# docker run -p 8848:8888 -v /home/quantum/WorkQuantum/Task07_SIP/Git/sip/data:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes --restart always --name pbd_jupyter_1 pbd_jupyter:latest
docker start -i pbd_jupyter_1