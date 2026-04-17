FROM node:20-alpine

WORKDIR /app

# Install frontend dependencies only to reduce network surface and improve build reliability.
COPY frontend/package.json ./package.json
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm install --no-audit --no-fund

# Copy frontend source and build.
COPY frontend/. .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
