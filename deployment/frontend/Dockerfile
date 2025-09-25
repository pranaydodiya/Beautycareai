# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm config set fetch-retries 5 \
  && npm config set fetch-timeout 120000 \
  && npm config set registry https://registry.npmjs.org/ \
  && npm ci
COPY . .

ARG REACT_APP_BACKEND_URL
ARG REACT_APP_CLERK_PUBLISHABLE_KEY
ARG NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_CLERK_PUBLISHABLE_KEY=$REACT_APP_CLERK_PUBLISHABLE_KEY
ENV NPM_CONFIG_REGISTRY=$NPM_CONFIG_REGISTRY

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]


