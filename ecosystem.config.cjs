const path = require('path');

module.exports = {
  apps: [
    {
      name: 'musicnest',
      script: path.resolve(__dirname, 'node_modules/next/dist/bin/next'),
      args: 'start -p 3030',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
