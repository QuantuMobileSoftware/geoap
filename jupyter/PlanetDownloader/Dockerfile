FROM jupyter/scipy-notebook:45bfe5a474fa

# environment name, python 3.x version
ARG conda_env=python37
ARG py_ver=3.7

USER root
RUN apt-get update && \
    apt-get install -y git gcc libspatialindex-dev python3-dev cmake curl libcurl4-openssl-dev

RUN conda create --quiet --yes -p $CONDA_DIR/envs/$conda_env python=$py_ver ipython ipykernel && \
    conda clean --all -f -y

# create Python 3.x environment and link it to jupyter
RUN $CONDA_DIR/envs/${conda_env}/bin/python -m ipykernel install --user --name=${conda_env} && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

# See https://docs.djangoproject.com/en/3.1/ref/contrib/gis/install/geolibs/

RUN wget https://www.sqlite.org/2022/sqlite-autoconf-3380200.tar.gz \
    && tar -xzf sqlite-autoconf-3380200.tar.gz \
    && cd sqlite-autoconf-3380200 \
    && ./configure \
    && make \
    && make install \
    && cd .. \
    && rm -rf sqlite-autoconf-3380200 sqlite-autoconf-3380200.tar.gz

RUN wget https://download.osgeo.org/libtiff/tiff-4.2.0.tar.gz \
    && tar -xzf tiff-4.2.0.tar.gz \
    && cd tiff-4.2.0 \
    && ./configure \
    && make \
    && make install \
    && cd .. \
    && rm -rf tiff-4.2.0 tiff-4.2.0.tar.gz

RUN wget http://download.osgeo.org/geos/geos-3.10.2.tar.bz2 \
    && tar -xjf geos-3.10.2.tar.bz2 \
    && cd geos-3.10.2 \
    && ./configure \
    && make \
    && make install \
    && cd .. \
    && rm -rf geos-3.10.2 geos-3.10.2.tar.bz2

RUN wget https://download.osgeo.org/proj/proj-9.0.0.tar.gz \
    && tar -xzf proj-9.0.0.tar.gz \
    && mkdir proj-9.0.0/build && cd proj-9.0.0/build \
    && cmake .. -DCMAKE_INSTALL_PREFIX=/usr/local -DCMAKE_BUILD_TYPE=Release -DBUILD_TESTING=OFF \
    && make -j$(nproc) \
    && make install \
    && cd ../.. \
    && rm -rf proj-9.0.0 proj-9.0.0.tar.gz proj-data-1.9.tar.gz

RUN wget http://download.osgeo.org/gdal/3.4.2/gdal-3.4.2.tar.gz \
    && tar -xzf gdal-3.4.2.tar.gz \
    && cd gdal-3.4.2 \
    && ./configure --with-python=$CONDA_DIR/envs/${conda_env}/bin/python --with-proj=/usr/local \
    && make \
    && make install \
    && cd .. \
    && rm -rf gdal-3.4.2 gdal-3.4.2.tar.gz

RUN projsync --all --quiet

RUN apt-get install -y mc \
    && pip install --global-option=build_ext --global-option="-I/usr/include/gdal" GDAL==`gdal-config --version`

COPY requirements_37.txt /tmp/
RUN pip install --requirement /tmp/requirements_37.txt && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER


USER $NB_UID

# prepend conda environment to path
ENV PATH $CONDA_DIR/envs/${conda_env}/bin:$PATH

# Using python37 env by default
ENV CONDA_DEFAULT_ENV ${conda_env}
