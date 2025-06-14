FROM node:24.1.0

WORKDIR /app

COPY package*.json /tmp
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app

EXPOSE 5173

CMD ["sh", "-c", "ln -snf /opt/app/node_modules /app/node_modules && npm run dev -- --host"]
