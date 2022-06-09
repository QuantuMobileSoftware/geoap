# Force cache external image to the private registry
FROM ubuntu:20.04

# Install base binary packages
RUN apt-get update && DEBIAN_FRONTEND="noninteractive" apt-get -y --no-install-recommends \
    install tzdata gcc python3.8-dev python3-setuptools curl lsb-release python3.8-venv python3-numpy gnupg2 && \
    rm -rf /var/lib/apt/lists/*

# Install gcloud
RUN echo "deb http://packages.cloud.google.com/apt cloud-sdk main" |  tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg |  apt-key add -
RUN apt-get update && apt-get install --no-install-recommends -y google-cloud-sdk python3-crcmod kubectl && rm -rf /var/lib/apt/lists/*

#setup venv
RUN python3.8 -m venv /env
ENV VIRTUAL_ENV /env
ENV PATH /env/bin:$PATH
RUN pip install --no-cache-dir -U pip

# Install requirements for opencv
RUN apt-get update && apt-get install --no-install-recommends -y libsm6 libxext6 libxrender-dev python3-tk && rm -rf /var/lib/apt/lists/*

# Install geospatial binary packages
RUN apt-get update && apt-get install --no-install-recommends -y libproj-dev gdal-bin libgdal-dev python3-gdal && rm -rf /var/lib/apt/lists/*

ENV PATH /usr/include/gdal:$PATH

# Copy the application's requirements.txt and run pip to install all
# dependencies into the virtualenv.
ADD requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r /requirements.txt

COPY jupyter_notebook_config.json /etc/jupyter/