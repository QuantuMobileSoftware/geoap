FROM node:14.5.0 as builder

WORKDIR /code
COPY ./webviewer /code
RUN npm install && npm run build

FROM nginx:1.19.3
COPY webserver/nginx-prod.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /code/dist /usr/share/nginx/html
