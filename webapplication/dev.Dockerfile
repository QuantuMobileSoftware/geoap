FROM python:3.7.7

ENV PYTHONUNBUFFERED 1

ARG UID
ARG GID

USER root
RUN apt-get update -y && apt-get upgrade -y\
    && apt-get install software-properties-common -y\
    && add-apt-repository "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -sc)-pgdg main"\
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -\
    && apt-get update\
    && apt-get install postgresql-client-13 -y

RUN python -m pip install --upgrade pip &&\
    mkdir /code &&\
    groupadd -g ${GID} sip &&\
    useradd -l -u ${UID} -g sip sip &&\
    install -d -m 0755 -o sip -g sip /home/sip &&\
    chown --changes --silent --no-dereference --recursive ${UID}:${GID} \
     /home/sip \
     /code

ENV PATH "$PATH:/home/sip/.local/bin"

WORKDIR /code
USER sip
COPY requirements.txt /code/
RUN pip install -r requirements.txt

COPY . /code/
