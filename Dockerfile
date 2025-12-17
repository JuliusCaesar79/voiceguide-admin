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
CMD ["serve", "-s", "dist", "-l", "8080"]
