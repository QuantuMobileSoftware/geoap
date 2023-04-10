FROM python:3.8.15-slim

RUN mkdir /code

WORKDIR /code
COPY ./ .

RUN pip install -r requirements.txt

CMD ["python", "data_tunnel.py"]
