FROM node:20-alpine AS build
WORKDIR /workspace
COPY apps/web-admin-manager/package*.json ./
RUN npm ci
COPY apps/web-admin-manager/ ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY infra/nginx/spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html
EXPOSE 80
