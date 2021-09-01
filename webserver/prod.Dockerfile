FROM node:14.5.0 as builder

WORKDIR /code
COPY ./soilmate_frontend /code
RUN npm install && npm run build

FROM nginx:1.19.3
COPY webserver/nginx-prod.conf /etc/nginx/nginx.conf
COPY webserver/default-prod.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /code/build /usr/share/nginx/html
