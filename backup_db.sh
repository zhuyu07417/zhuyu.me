#!/bin/bash
DATE=$(date '+%Y%m%d_%H%M%S')
BACKUP_DIR="/path/to/your/site/backups"

# 备份PostgreSQL
pg_dump -h 127.0.0.1 -U zhuyu -d zhuyu > $BACKUP_DIR/zhuyu_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "备份完成: zhuyu_$DATE.sql"
