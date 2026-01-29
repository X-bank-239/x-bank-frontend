# === Build stage ===
FROM node:20-alpine AS builder

WORKDIR /app

# Кэш зависимостей: меняем реже всего
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Исходники — меняются чаще
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# === Runner: Next.js standalone + Nginx ===
FROM node:20-alpine AS runner

RUN apk add --no-cache nginx curl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# # Standalone: server + static, отдельно public
# COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY nginx.conf /etc/nginx/http.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
