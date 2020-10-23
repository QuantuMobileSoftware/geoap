FROM python:3.7.7

ENV PYTHONUNBUFFERED=1

ARG UID
ARG GID
ENV UID=${UID}
ENV GID=${GID}

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
