#!/bin/sh
docker build -f Dockerfile -t ebi_jupyter .
docker run -d -p 8845:8888 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes --restart always --name ebi_jupyter_1 ebi_jupyter:latest start-notebook.sh --NotebookApp.password='54fc29cc3359e4689a37e40601bb957e'
