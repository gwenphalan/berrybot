FROM node:alpine
LABEL maintainer="GwenPhalan"
WORKDIR /src

RUN apk update && apk add install -y --no-install-recommends yarn build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev  && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY package.json /src/package.json
RUN yarn

COPY . /src

CMD yarn start