FROM quantumobile/sip-base:1607542908

RUN mkdir /code

WORKDIR /code

COPY requirements.txt /code/
RUN pip install -r requirements.txt
ARG SECRET_KEY
ENV SECRET_KEY ${SECRET_KEY}
ARG GOOGLE_CLOUD_UPLOAD_ORIGIN
ENV GOOGLE_CLOUD_UPLOAD_ORIGIN ${GOOGLE_CLOUD_UPLOAD_ORIGIN}

COPY . /code/
RUN python -m compileall -b . && find -name '*.py' -exec rm {} \;
