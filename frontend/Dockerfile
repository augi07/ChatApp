FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copia los archivos desde la raíz de ./frontend
COPY package.json ./
RUN pnpm install

# Copia todo el frontend
COPY . .


CMD ["pnpm", "next", "dev"]
