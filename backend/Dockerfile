# Multi-stage: neither the TypeScript toolchain nor the C++ build tools reach the
# shipped image. Pattern copied from omega; each line of it was paid for elsewhere.

# ── stage 1: compile the TypeScript ──────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── stage 2: production dependencies, including native ones ──────────────────────────
# Its own stage so python3/make/g++ are available to compile bcrypt and are then thrown
# away with the stage rather than shipping in the runtime image.
#
# 📌 The `prepare` script points husky at a hooks path outside /app and ends in `|| true`,
#    so it is harmless here — no --ignore-scripts workaround needed, and bcrypt therefore
#    builds during npm ci as normal.
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ── stage 3: the runtime ─────────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# ⚠️ dist/src/main.js, not dist/main.js — nest build preserves the src/ directory here,
#    which is also why app.module.ts's __dirname-relative migrations glob resolves to
#    dist/src/typeorm/migrations. `migrationsRun: true` means deploying is migrating.
USER node
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
