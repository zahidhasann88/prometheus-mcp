# syntax=docker/dockerfile:1.7

# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install deps with reproducible lockfile, dev deps included for the build.
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Drop dev deps for the runtime image.
RUN npm prune --omit=dev

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

# Non-root user — least privilege.
RUN addgroup -S app && adduser -S -G app app

COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist
COPY --chown=app:app package.json ./

USER app

# stdio MCP — nothing to expose, no healthcheck for stdio servers.
ENV NODE_ENV=production
ENTRYPOINT ["node", "dist/index.js"]
