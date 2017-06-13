#! /usr/bin/env node

const pino = require('pino');
const ngrok = require('ngrok');
const express = require('express');
const bodyParser = require('body-parser');
const absoluteUrl = require('absolute-url');

const logger = require('./logger');

const app = express();
app.enable('trust proxy');
app.use(absoluteUrl());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res) => {
  const log = {
    url: req.url,
    query: req.query,
    headers: req.headers,
    body: req.body
  };
  logger.info(log, `${req.method} ${req.absoluteUrl()}`);
  res.json({ message: 'ok' });
});

const port = process.env.PORT || 3000;
ngrok.connect(port, (ngrokError, url) => {
  if (ngrokError) {
    logger.error(ngrokError, 'Error connecting to ngrok');
    return;
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error(err);
      return;
    }

    logger.info(`Local URL: http://localhost:${port}`);
    logger.info(`Public URL: ${url}`);
  });
});
