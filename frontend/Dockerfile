FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/package.json
RUN npm install
COPY . .
RUN npm --workspace frontend run build
EXPOSE 3000
CMD ["npm", "--workspace", "frontend", "run", "start"]
