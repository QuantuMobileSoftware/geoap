FROM quantumobile/sip-base:1604073384

RUN mkdir /code

WORKDIR /code

COPY requirements.txt /code/
RUN pip install -r requirements.txt

COPY . /code/
