FROM node:18

WORKDIR /dist/

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 4000
CMD node run start