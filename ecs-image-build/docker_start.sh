#!/bin/bash
#
# Start script for acsp-confirm-client-id-verfication-web

PORT=3000

export NODE_PORT=${PORT}

exec node /opt/server.js -- ${PORT}