// PM2 Configuration for Short Circuit Webapp
module.exports = {
  apps: [
    {
      name: 'shortcircuit',
      script: 'npx',
      args: 'wrangler pages dev dist --persist-to=.wrangler/state --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
