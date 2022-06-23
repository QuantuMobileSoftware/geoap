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
    
ARG conda_env=python37
ARG py_ver=3.7

RUN conda create --quiet --yes -p $CONDA_DIR/envs/$conda_env python=$py_ver ipython ipykernel && \
    conda clean --all -f -y

# create Python 3.x environment and link it to jupyter
RUN $CONDA_DIR/envs/${conda_env}/bin/python -m ipykernel install --user --name=${conda_env} && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER
    
  
USER $NB_UID

# prepend conda environment to path
ENV PATH $CONDA_DIR/envs/${conda_env}/bin:$PATH

# Using python37 env by default
ENV CONDA_DEFAULT_ENV ${conda_env}
COPY jupyter_notebook_config.json /etc/jupyter/
