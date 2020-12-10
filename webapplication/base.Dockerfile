FROM python:3.7.7

ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get upgrade -y\
    && apt-get install software-properties-common -y\
    && add-apt-repository "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -sc)-pgdg main"\
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -\
    && apt-get update\
    && apt-get install postgresql-client-13 -y\
    && apt-get install sqlite3 -y

# See https://docs.djangoproject.com/en/3.1/ref/contrib/gis/install/geolibs/

RUN wget https://download.osgeo.org/geos/geos-3.8.1.tar.bz2 \
    && tar -xjf geos-3.8.1.tar.bz2 \
    && cd geos-3.8.1 \
    && ./configure \
    && make \
    && make install \
    && cd .. \
    && rm -rf geos-3.8.1 geos-3.8.1.tar.bz2

RUN wget https://download.osgeo.org/proj/proj-6.3.2.tar.gz \
    && wget https://download.osgeo.org/proj/proj-datumgrid-1.8.tar.gz \
    && tar -xzf proj-6.3.2.tar.gz \
    && mkdir proj-6.3.2/nad && cd proj-6.3.2/nad \
    && tar -xzf ../../proj-datumgrid-1.8.tar.gz \
    && cd .. \
    && ./configure \
    && make \
    && make install \
    && cd .. \
    && rm -rf proj-6.3.2 proj-6.3.2.tar.gz proj-datumgrid-1.8.tar.gz

RUN wget https://download.osgeo.org/gdal/3.1.4/gdal-3.1.4.tar.gz \
    && tar -xzf gdal-3.1.4.tar.gz \
    && cd gdal-3.1.4 \
    && ./configure --with-python=python3 --with-proj=/usr/local \
    && make \
    && make install \
    && cd .. \
    && rm -rf gdal-3.1.4 gdal-3.1.4.tar.gz

RUN git clone https://github.com/mapbox/tippecanoe.git \
    && cd tippecanoe \
    && git checkout tags/1.36.0 \
    && make -j \
    && make install \
    && cd .. \
    && rm -rf tippecanoe

RUN ldconfig

# docker build -f base.Dockerfile -t quantumobile/sip-base:`date +%s` .
