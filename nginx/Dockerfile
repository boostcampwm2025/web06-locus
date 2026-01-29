FROM node:22-alpine AS builder
RUN npm install -g pnpm turbo
WORKDIR /app
COPY . .
RUN pnpm install

ARG VITE_NAVER_CLIENT_ID
ARG VITE_API_BASE_URL
ARG VITE_SENTRY_DSN
# firebase 설정
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FCM_VAPID_KEY

# 빌드 명령 실행 직전에 .env 파일을 강제로 생성
RUN echo "VITE_NAVER_CLIENT_ID=$VITE_NAVER_CLIENT_ID" > apps/web/.env.production && \
    echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" >> apps/web/.env.production && \
    echo "VITE_SENTRY_DSN=$VITE_SENTRY_DSN" >> apps/web/.env.production && \
    echo "VITE_FCM_VAPID_KEY=$VITE_FCM_VAPID_KEY" >> apps/web/.env.production
    echo "VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY" >> apps/web/.env.production && \
    echo "VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN" >> apps/web/.env.production && \
    echo "VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID" >> apps/web/.env.production && \
    echo "VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET" >> apps/web/.env.production && \
    echo "VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID" >> apps/web/.env.production && \
    echo "VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID" >> apps/web/.env.production && \

RUN pnpm turbo run build --filter=@locus/web

FROM nginx:stable-alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]