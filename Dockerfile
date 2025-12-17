# ---- build stage
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime stage
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist

RUN npm i -g serve

EXPOSE 8080

# IMPORTANT: serve wants a proper listen endpoint on some versions
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT:-8080}"]
