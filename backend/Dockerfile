# syntax=docker/dockerfile:1
#
#FROM node:lts-alpine
#WORKDIR /bookcars/backend
#COPY ./backend ./
#COPY ./backend/.env.docker .env
#COPY ./packages /bookcars/packages
#RUN npm install
#
#CMD [ "npm", "run", "start:setup"]
#EXPOSE 4002
#
#
# syntax=docker/dockerfile:1

FROM node:lts-alpine
WORKDIR /bookcars/backend

COPY ./backend ./
COPY ./packages /bookcars/packages

RUN npm install
RUN npm run build

CMD ["sh", "-c", "node dist/src/setup/setup.js && node --import ./dist/src/monitoring/instrument.js dist/src"]

EXPOSE 4002
