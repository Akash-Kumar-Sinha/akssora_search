FROM oven/bun:1-debian AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-debian

WORKDIR /app

COPY --from=base /app/package.json ./
COPY --from=base /app/bun.lock ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.* ./
COPY --from=base /app/.env ./.env

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["bun", "run", "start"]