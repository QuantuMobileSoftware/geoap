#!/bin/sh
docker build -f Dockerfile -t ebi_jupyter .
docker run -d -p 8845:8888 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes --restart always --name ebi_jupyter_1 ebi_jupyter:latest start-notebook.sh --NotebookApp.password='argon2:$argon2id$v=19$m=10240,t=10,p=8$9NSKjsQQstYPwF4PG12pVg$o1LB41H3WrDhFVZdWO+BxhMfw6UgWj8bQeeCD67eYIc'
