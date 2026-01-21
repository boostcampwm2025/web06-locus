FROM node:22-alpine AS builder
RUN npm install -g pnpm turbo
WORKDIR /app
COPY . .
RUN pnpm install

ARG VITE_NAVER_CLIENT_ID
ARG VITE_API_BASE_URL

# 빌드 명령 실행 직전에 .env 파일을 강제로 생성
RUN echo "VITE_NAVER_CLIENT_ID=$VITE_NAVER_CLIENT_ID" > apps/web/.env.production && \
    echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" >> apps/web/.env.production

RUN pnpm turbo run build --filter=@locus/web

FROM nginx:stable-alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]