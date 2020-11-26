FROM jupyter/scipy-notebook:45bfe5a474fa
USER root

# Add metadata identifying these images as our build containers (this will be useful later!)

# Take an SSH key as a build argument.
ARG SSH_KEY
# Install dependencies required to git clone.
RUN apt-get update && \
    apt-get install -y \
     git \
     openssh-server \
     gcc libspatialindex-dev python3-dev

# 1. Create the SSH directory.
# 2. Populate the private key file.
# 3. Set the required permissions.
# 4. Add github to our list of known hosts for ssh.
RUN mkdir -p /root/.ssh/ && \
    echo "$SSH_KEY" > /root/.ssh/id_rsa && \
    chmod -R 600 /root/.ssh/ && \
    ssh-keyscan -t rsa github.com 2>&1 >> /root/.ssh/known_hosts
RUN ls -a  /root/.ssh

# RUN git clone git@github.com:Leaflet/Leaflet.VectorGrid.git
# RUN pip install git+ssh://git@github.com/QuantuMobileSoftware/sentinel2tools.git@master
# Authorize SSH Host
# RUN ssh -Tv git@github.com

# USER $NB_UID

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


# any additional pip installs
RUN $CONDA_DIR/envs/${conda_env}/bin/pip install --requirement /tmp/requirements_37.txt && \
                                                   fix-permissions $CONDA_DIR && \
                                                   fix-permissions /home/$NB_USER

# prepend conda environment to path
ENV PATH $CONDA_DIR/envs/${conda_env}/bin:$PATH

# Using python37 env by default
ENV CONDA_DEFAULT_ENV ${conda_env}

# USER root
# Remove SSH keys
RUN rm -rf /root/.ssh/







# docker build --build-arg SSH_KEY="$(cat ~/.ssh/id_rsa_github)" .


# docker-compose build --build-arg SSH_KEY="$(cat ~/.ssh/id_rsa_github1)"
