FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

FROM base AS build
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @portalgis/shared build
RUN pnpm --filter @portalgis/gis-core build
RUN pnpm --filter @portalgis/web build

FROM base AS runner
WORKDIR /app
COPY --from=build /app ./
EXPOSE 3000
CMD ["pnpm", "--filter", "@portalgis/web", "serve"]
