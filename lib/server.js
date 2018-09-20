const express = require('express');
const api = require('./api');

function boot() {
  const app = express();

  app.get('/api/tests', api.getTests);
  app.get('/api/run', api.runTest);

  app.use((req, res) => res.status(404).send(`404: Page not found`));
  app.use(api.errorHandler);

  app.listen(process.env.PORT || 5555);
  console.log(`App started listening on port ${process.env.PORT}`);
}

module.exports = boot;
