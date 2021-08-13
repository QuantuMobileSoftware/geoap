FROM common_disease_detection:latest

COPY ./data/notebooks/dd /home/$NB_UID/code/src
USER root
RUN fix-permissions /home/$NB_UID/code/src

USER $NB_UID