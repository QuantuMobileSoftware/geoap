FROM python:3.7.7

ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get upgrade -y\
    && apt-get install software-properties-common -y\
    && add-apt-repository "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -sc)-pgdg main"\
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -\
    && apt-get update\
    && apt-get install postgresql-client-13 -y\
    && apt-get install sqlite3 -y

RUN wget https://download.osgeo.org/proj/proj-7.1.1.tar.gz \
    && tar -xzf proj-7.1.1.tar.gz \
    && cd proj-7.1.1 \
    && ./configure \
    && make \
    && make install \
    && cd .. \
    && rm -rf proj-7.1.1 proj-7.1.1.tar.gz

RUN wget https://download.osgeo.org/gdal/3.1.4/gdal-3.1.4.tar.gz \
    && tar -xzf gdal-3.1.4.tar.gz \
    && cd gdal-3.1.4 \
    && ./configure --with-python=python3 --with-proj=/usr/local \
    && make \
    && make install \
    && cd .. \
    && rm -rf gdal-3.1.4 gdal-3.1.4.tar.gz

RUN ldconfig

# docker build -f base.Dockerfile -t quantumobile/sip-base:`date +%s` .
