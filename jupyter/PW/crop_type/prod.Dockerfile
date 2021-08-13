FROM common_planet_watchers:latest

COPY ./data/notebooks/pw /home/jovyan/code/src

USER root
RUN fix-permissions /home/$NB_USER

USER $NB_UID