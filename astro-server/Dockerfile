FROM node:lts-slim AS base

FROM base AS build
RUN apt-get update -y && apt-get install -y openssl dumb-init

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm ci 
RUN npm run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server/entry.mjs"]

