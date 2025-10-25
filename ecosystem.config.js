module.exports = {
  apps: [
    {
      name: 'conselhos-esotericos',
      script: './dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      }
    },
    {
      name: 'conselhos-websocket',
      script: './dist/websocket.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        WS_PORT: 5001
      }
    }
  ]
}