FROM python:3.8.15-slim

# Needed for geopandas&shapely to work
RUN apt-get update && \
    apt-get install -y \
    git \
    libspatialindex-dev

RUN mkdir /code

WORKDIR /code
COPY ./ .

RUN pip install jupyter==1.0.0
RUN pip install -r requirements.txt

CMD ["jupyter", "nbconvert", "--inplace", "--to=notebook", "--execute", "./TCI_NDVI.ipynb"]
