FROM jupyter/scipy-notebook:45bfe5a474fa

USER root
RUN apt-get update && \
    apt-get install -y \
    git \
    gcc libspatialindex-dev python3-dev

COPY requirements.txt requirements_37.txt /tmp/
RUN pip install --requirement /tmp/requirements.txt && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

# environment name, python 3.x version
ARG conda_env=python37
ARG py_ver=3.7

RUN conda create --quiet --yes -p $CONDA_DIR/envs/$conda_env python=$py_ver ipython ipykernel && \
    conda clean --all -f -y

# create Python 3.x environment and link it to jupyter
RUN $CONDA_DIR/envs/${conda_env}/bin/python -m ipykernel install --user --name=${conda_env} && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER
USER $NB_UID

USER $NB_UID


# any additional pip installs
RUN $CONDA_DIR/envs/${conda_env}/bin/pip install --requirement /tmp/requirements_37.txt && \
                                                   fix-permissions $CONDA_DIR && \
                                                   fix-permissions /home/$NB_USER

# prepend conda environment to path
ENV PATH $CONDA_DIR/envs/${conda_env}/bin:$PATH

# Using python37 env by default
ENV CONDA_DEFAULT_ENV ${conda_env}

