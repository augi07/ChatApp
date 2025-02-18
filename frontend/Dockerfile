FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy the files from the root of ./frontend
COPY package.json ./
RUN pnpm install

# Copy the entire frontend
COPY . .


CMD ["pnpm", "next", "dev"]
