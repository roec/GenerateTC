FROM node:20-alpine

WORKDIR /app

# Install backend dependencies only to reduce network surface and improve build reliability.
COPY backend/package.json ./package.json
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm install --no-audit --no-fund

# Copy backend source and build.
COPY backend/. .
RUN npm run build

EXPOSE 3001
CMD ["npm", "run", "start"]
