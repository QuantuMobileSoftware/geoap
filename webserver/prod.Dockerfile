FROM node:14.5.0 as builder

WORKDIR /code
COPY ./webviewer/src /code/src
COPY ./webviewer/*.json /code/
COPY ./webviewer/webpack.config.js /code/webpack.config.js
RUN npm install && npm run build

FROM nginx:1.19.3
COPY webserver/nginx-prod.conf /etc/nginx/nginx.conf
COPY webserver/default-prod.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /code/dist /usr/share/nginx/html
