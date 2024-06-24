#!/bin/bash
# Start script for acsp-confirm-client-id-verification-web
npm i
PORT=3000

export NODE_PORT=${PORT}

for entry in /opt/*
do
  echo "$entry"
done

exec node /opt/server.js -- ${PORT}
