FROM node:14.14-alpine
WORKDIR /app
COPY . .
RUN npm i --production
CMD npm run start