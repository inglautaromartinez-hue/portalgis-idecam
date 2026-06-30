FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

FROM base AS build
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @portalgis/shared build
RUN pnpm --filter @portalgis/gis-core build
RUN pnpm --filter @portalgis/api db:generate
RUN pnpm --filter @portalgis/api build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app ./
EXPOSE 3001
CMD sh -c "pnpm --filter @portalgis/api db:migrate && pnpm --filter @portalgis/api db:seed && pnpm --filter @portalgis/api start"
