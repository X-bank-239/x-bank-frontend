#!/bin/sh
set -e

# Запускаем Next.js (standalone) в фоне на порту 3000
echo "Starting Next.js..."
cd /app && node server.js &
NODE_PID=$!

# Ждём, пока Next.js начнёт принимать соединения (curl есть в образе)
echo "Waiting for Next.js on port 3000..."
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  if curl -sf http://127.0.0.1:3000/ >/dev/null 2>&1; then
    echo "Next.js is ready."
    break
  fi
  sleep 1
done

# Если за 15 секунд не поднялся — продолжаем (nginx будет ретраить)
if ! kill -0 $NODE_PID 2>/dev/null; then
  echo "Warning: Next.js process may have exited."
fi

# Nginx в foreground — основной процесс контейнера
echo "Starting Nginx on port 80..."
exec nginx -g "daemon off;"
