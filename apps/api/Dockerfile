FROM node:22-alpine AS base
RUN npm install -g pnpm turbo

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune @locus/api --docker

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

COPY --from=builder /app/out/full/ .

RUN pnpm turbo run db:generate --filter=@locus/api
RUN pnpm turbo run build --filter=@locus/api...


EXPOSE 3000
CMD ["pnpm", "--filter", "@locus/api", "start:prod"]