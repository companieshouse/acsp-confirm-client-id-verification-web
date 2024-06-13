#!/bin/bash
#
# Start script for acsp-confirm-client-id-verification-web

PORT=3000

export NODE_PORT=${PORT}

exec node /opt/server.js -- ${PORT}