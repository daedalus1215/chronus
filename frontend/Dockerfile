FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# ⚠️ vite.config.ts imports ./vite.env.config unconditionally, and that file is GITIGNORED.
#    Its values feed only `server` and `preview` — nothing from it reaches the production
#    bundle — but the import still has to resolve, so a clean checkout cannot build without
#    it. Building from a developer's working tree hides this, because the untracked file is
#    sitting right there; building from a git worktree or CI does not.
RUN cp vite.env.config.sample.ts vite.env.config.ts
# The axios interceptor sets baseURL '/' and prepends /api per request, so the bundle is
# origin-relative — one image is correct in every environment, with nothing baked in.
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
