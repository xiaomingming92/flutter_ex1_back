module.exports = {
  apps: [
    {
      name: 'ex1-api',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
    },
  ],
};
