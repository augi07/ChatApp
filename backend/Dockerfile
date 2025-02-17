FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm

# Copia los archivos desde la raíz de ./backend
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "dev"]
