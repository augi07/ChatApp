FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm

# Copy the files from the root of ./backend
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "dev"]
