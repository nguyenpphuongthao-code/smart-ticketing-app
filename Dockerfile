# Dockerfile for "Chờ vé thông minh" Next.js + SQLite Production (Render / Cloud / VPS)
FROM node:20-alpine AS builder

WORKDIR /app

# Cài đặt OpenSSL cho Prisma trên Alpine
RUN apk add --no-cache openssl libc6-compat

# Sao chép file cấu hình và khai báo thư viện
COPY package*.json tsconfig.json tailwind.config.ts postcss.config.js ./
COPY prisma ./prisma/

# Cài đặt toàn bộ dependencies (bao gồm devDependencies để build)
RUN npm install

# Sao chép toàn bộ mã nguồn VÀ THƯ MỤC DATA
COPY src ./src
COPY public ./public
COPY data ./data

# Tạo Prisma client và build Next.js
RUN npx prisma generate
RUN node --max-old-space-size=4096 ./node_modules/next/dist/bin/next build

# -------------------------------------------------------------
# Runner stage: Container chạy production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Render mặc định sử dụng port 10000
ENV PORT=10000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache openssl libc6-compat

# Copy node_modules, build output, prisma, public VÀ DATA
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/data ./data

# Hỗ trợ cả port 10000 (Render) và 3000 (Local / VPS)
EXPOSE 10000 3000

# Chạy push schema SQLite, seed dữ liệu thật và khởi động Next.js đúng port của Render
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts && npx next start -H 0.0.0.0 -p ${PORT:-10000}"]