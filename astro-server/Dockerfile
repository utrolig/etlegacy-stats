FROM node:lts-slim AS base

FROM base AS build
RUN apt-get update -y && apt-get install -y openssl dumb-init curl

COPY . /usr/src/app
RUN chmod +x /usr/src/app/start.sh
WORKDIR /usr/src/app
RUN npm ci 
RUN npm run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/bin/sh", "start.sh"]
