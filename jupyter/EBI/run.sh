#!/bin/sh
docker build -f Dockerfile -t EBI_jupyter .
docker run -d -p 8847:8888 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes --restart always --name EBI_jupyter_1 EBI_jupyter:latest start-notebook.sh --NotebookApp.password='sha1:3a4d2020156f:2c3aa52c72a8cbbac85734e255c340510eb75eac'
