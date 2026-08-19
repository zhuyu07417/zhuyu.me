module.exports = {
  apps: [
    {
      name: 'fastapi-backend',
      script: '/path/to/your/site/zhuyu-main/zhuyu-backend/venv/bin/uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8000',
      cwd: '/path/to/your/site/zhuyu-main/zhuyu-backend',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'nextjs-frontend',
      script: '/path/to/your/site/zhuyu-main/zhuyu/node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/path/to/your/site/zhuyu-main/zhuyu',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'netease-api',
      script: '/path/to/your/site/netease-api/app.js',
      cwd: '/path/to/your/site/netease-api',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M'
    }
  ]
};
