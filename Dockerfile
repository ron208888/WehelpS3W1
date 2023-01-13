FROM alpine:3.16
WORKDIR /usr/src/app
COPY package*.json ./

RUN apk add --no-cache npm
COPY . .
EXPOSE 8080
CMD [ "node", "index.js" ]