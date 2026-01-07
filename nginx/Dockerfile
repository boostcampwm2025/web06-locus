FROM node:22-alpine AS builder
RUN npm install -g pnpm turbo
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm turbo run build --filter=@locus/web

FROM nginx:stable-alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]