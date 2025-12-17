# ---- build stage
FROM node:22-alpine AS build
WORKDIR /app

# Install deps (clean, reproducible)
COPY package.json package-lock.json ./
RUN npm ci

# Build
COPY . .
RUN npm run build

# ---- runtime stage
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install a tiny static server
RUN npm i -g serve

# Copy only build output
COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
