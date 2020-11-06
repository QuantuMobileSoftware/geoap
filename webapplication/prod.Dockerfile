FROM quantumobile/sip-base:1604233288

RUN mkdir /code

WORKDIR /code

COPY requirements.txt /code/
RUN pip install -r requirements.txt

COPY . /code/
RUN python -m compileall -b . && find -name '*.py' -exec rm {} \;
