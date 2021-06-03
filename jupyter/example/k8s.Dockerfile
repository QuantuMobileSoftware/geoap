FROM jupyter/scipy-notebook:45bfe5a474fa

USER root

#RUN groupadd -g 2000 nfs && usermod -u  $NB_USER && fix-permissions /home/$NB_USER

RUN apt-get update && \
    apt-get install -y \
    git \
    gcc libspatialindex-dev python3-dev

COPY ./jupyter/example/requirements.txt ./jupyter/example/requirements_37.txt /tmp/
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

# any additional pip installs
RUN $CONDA_DIR/envs/${conda_env}/bin/pip install --requirement /tmp/requirements_37.txt && \
                                                   $CONDA_DIR/envs/${conda_env}/bin/pip install nbconvert==6.0.7 && \
                                                   fix-permissions $CONDA_DIR && \
                                                   fix-permissions /home/$NB_USER

# prepend conda environment to path
ENV PATH $CONDA_DIR/envs/${conda_env}/bin:$PATH

# Using python37 env by default
ENV CONDA_DEFAULT_ENV ${conda_env}

ARG NOTEBOOK_EXECUTION_PATH='/home/jovyan/code/src/notebook.ipynb'
ENV NOTEBOOK_EXECUTION_PATH ${NOTEBOOK_EXECUTION_PATH}

RUN mkdir -p /home/jovyan/code/src
COPY ./webapplication/aoi/management/commands/executor/NotebookExecutor.py /home/jovyan/code
WORKDIR $HOME