FROM nginx:alpine

COPY nginx.conf /etc/nginx/templates/default.conf.template

ENV ASTRO_UPSTREAM=http://localhost:4321

EXPOSE 8080
