FROM node:24-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# The output is in /app/dist.
# This container will stop after the build completes.