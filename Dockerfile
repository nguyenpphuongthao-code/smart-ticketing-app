# Dockerfile for "Chờ vé thông minh" Next.js + SQLite Production
FROM node:20-alpine AS builder

WORKDIR /app

# Cài đặt OpenSSL cho Prisma trên Alpine
RUN apk add --no-cache openssl libc6-compat

# Sao chép file khai báo thư viện
COPY package*.json tsconfig.json tailwind.config.ts postcss.config.js ./
COPY prisma ./prisma/

# Cài đặt toàn bộ dependencies (bao gồm devDependencies để build)
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY src ./src
COPY public ./public 2>/dev/null || true

# Tạo Prisma client và build Next.js
RUN npx prisma generate
RUN node --max-old-space-size=4096 ./node_modules/next/dist/bin/next build

# -------------------------------------------------------------
# Runner stage: Container chạy production gọn nhẹ
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache openssl libc6-compat

# Copy node_modules, build output và prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public 2>/dev/null || true

EXPOSE 3000

# Chạy migrate và khởi động server Next.js
CMD ["sh", "-c", "npx prisma migrate deploy && tsx prisma/seed.ts && npm run start"]
