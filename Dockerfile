FROM node:alpine
LABEL maintainer="GwenPhalan"
WORKDIR /src

COPY package.json /src/package.json
RUN npm install

COPY . /src

CMD npm start