FROM node:16-alpine
RUN mkdir -p /app/config /app/src
WORKDIR /app
COPY package.json /app/package.json


RUN npm install -g nodemon


RUN npm install

COPY . .

EXPOSE 3030

CMD ["npm", "run", "dev"]