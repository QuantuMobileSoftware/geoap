FROM jupyter/scipy-notebook:45bfe5a474fa

USER root

COPY requirements.txt requirements_37.txt /tmp/
RUN pip install --requirement /tmp/requirements.txt && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

RUN pip install nbdime

RUN pip install jupyter_contrib_nbextensions
RUN jupyter labextension install @jupyterlab/github

RUN pip install jupyterlab-git

RUN jupyter labextension install @jupyterlab/git

RUN jupyter serverextension enable --sys-prefix jupyterlab_github git


RUN pip install --upgrade jupyterlab_gitplus
RUN jupyter labextension install @reviewnb/jupyterlab_gitplus
RUN jupyter serverextension enable --py jupyterlab_gitplus

RUN jupyter lab build

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
                                                   fix-permissions $CONDA_DIR && \
                                                   fix-permissions /home/$NB_USER

# prepend conda environment to path
ENV PATH $CONDA_DIR/envs/${conda_env}/bin:$PATH

# Using python37 env by default
ENV CONDA_DEFAULT_ENV ${conda_env}


