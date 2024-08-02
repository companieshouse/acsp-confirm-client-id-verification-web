ARG IMAGE_VERSION="latest"
FROM 416670754337.dkr.ecr.eu-west-2.amazonaws.com/ci-node-runtime-20:${IMAGE_VERSION} 
WORKDIR /opt
COPY locales ./locales
COPY assets ./assets
COPY node_modules ./node_modules
COPY dist docker_start.sh ./package.json ./package-lock.json ./

CMD ["./docker_start.sh"]

EXPOSE 3000