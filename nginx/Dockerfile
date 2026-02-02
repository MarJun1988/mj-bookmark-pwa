FROM nginx:alpine

COPY config/nginx.conf /etc/nginx/
COPY config/default.conf /etc/nginx/conf.d/

RUN apk update \
    && apk upgrade \
    && apk add --no-cache nano

EXPOSE 80 443