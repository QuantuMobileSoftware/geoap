FROM cschranz/gpu-jupyter:latest

USER root

RUN rm /etc/apt/sources.list.d/cuda.list
RUN rm /etc/apt/sources.list.d/nvidia-ml.list

RUN apt-get update && \
    apt-get install -y \
    git \
    gcc libspatialindex-dev python3-dev

COPY requirements.txt /tmp/
RUN pip install --requirement /tmp/requirements.txt && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

RUN pip install jupyter_contrib_nbextensions jupyterlab-git && \
    jupyter labextension install @jupyterlab/git && \
    jupyter lab build

# Install geospatial binary packages
RUN apt-get update && apt-get install --no-install-recommends -y libproj-dev gdal-bin libgdal-dev python3-gdal && rm -rf /var/lib/apt/lists/*

ENV PATH /usr/include/gdal:$PATH

USER $NB_UID

COPY jupyter_notebook_config.json /etc/jupyter/
