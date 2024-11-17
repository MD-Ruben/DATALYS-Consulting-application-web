module.exports = {
  apps: [{
    name: "datalys-app",
    script: "server.js",
    env: {
      NODE_ENV: "production",
      PORT: 3001
    },
    instances: 1,
    exec_mode: "cluster",
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: "production"
    },
    error_file: "/var/log/pm2/datalys-app-error.log",
    out_file: "/var/log/pm2/datalys-app-out.log",
    time: true
  }]
} 