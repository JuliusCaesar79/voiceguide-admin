# ---- build stage
FROM node:22-alpine AS build
WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm ci

# build app
COPY . .
RUN npm run build

# ---- runtime stage
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

# copy build output
COPY --from=build /app/dist ./dist

# static server
RUN npm i -g serve

EXPOSE 8080

# IMPORTANT: bind to 0.0.0.0 and Railway PORT
CMD ["sh", "-c", "serve -s dist -l 0.0.0.0:${PORT:-8080}"]
