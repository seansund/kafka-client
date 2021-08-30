FROM quay.io/ibmgaragecloud/node:lts-stretch

WORKDIR /client

COPY . .

RUN npm install --unsafe-perm && npm run build

ENTRYPOINT ["/client/kafka-client"]
