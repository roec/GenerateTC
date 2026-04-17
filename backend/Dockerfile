FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/package.json
RUN npm install
COPY . .
RUN npm --workspace backend run build
EXPOSE 3001
CMD ["npm", "--workspace", "backend", "run", "start"]
