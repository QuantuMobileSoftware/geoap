FROM cschranz/gpu-jupyter:latest

COPY environment.yml /tmp/

RUN conda env create -f /tmp/environment.yml -q && \
    conda run -n PW python -m ipykernel install --user --name=PW
RUN conda init bash && \
    echo "conda activate PW" >> ~/.bashrc && \
    exec bash

USER root

# Install ESA SNAP for Sentinel-1 preprocessing
RUN wget -q http://step.esa.int/downloads/8.0/installers/esa-snap_sentinel_unix_8_0.sh && \
    chmod +x ./esa-snap_sentinel_unix_8_0.sh && \
    ./esa-snap_sentinel_unix_8_0.sh -q && \
    rm esa-snap_sentinel_unix_8_0.sh && \
    ln -s /opt/snap/bin/gpt /usr/bin/gpt

# Update ESA SNAP to the latest version
COPY esa_snap_update.sh /tmp/
RUN /tmp/esa_snap_update.sh

# Add data required for Sentinel-1 preprocessing
RUN mkdir -p /home/jovyan/.snap/auxdata/dem/ && \
    ln -s /home/jovyan/work/notebooks/pw/data/SRTM\ 3Sec /home/jovyan/.snap/auxdata/dem/

# Install Sen2Cor for conversion of Sentinel-2 L1C products to L2A products
# sen2cor_install.sh is a part of sentinel2tools package
RUN apt-get update && \
    apt-get install -y wget file && \
    conda run -n PW sen2cor_install.sh

RUN fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

USER $NB_UID