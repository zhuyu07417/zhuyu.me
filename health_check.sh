#!/bin/bash
LOG_FILE="/path/to/your/site/health_check.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] 开始健康检查..." >> $LOG_FILE

# 检查FastAPI后端
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs | grep -q "200"; then
    echo "[$DATE] FastAPI后端: 正常" >> $LOG_FILE
else
    echo "[$DATE] FastAPI后端: 异常，正在重启..." >> $LOG_FILE
    pm2 restart fastapi-backend
fi

# 检查Next.js前端
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "[$DATE] Next.js前端: 正常" >> $LOG_FILE
else
    echo "[$DATE] Next.js前端: 异常，正在重启..." >> $LOG_FILE
    pm2 restart nextjs-frontend
fi

# 检查网易云音乐API
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
    echo "[$DATE] 网易云音乐API: 正常" >> $LOG_FILE
else
    echo "[$DATE] 网易云音乐API: 异常，正在重启..." >> $LOG_FILE
    pm2 restart netease-api
fi

echo "[$DATE] 健康检查完成" >> $LOG_FILE
echo "" >> $LOG_FILE
