if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express'),
      cookieParser = require('cookie-parser'),
      app = express(),
      routers = require('./routes/User'),
      rateLimit = require('express-rate-limit'),
      limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
      }),
      port = process.env.NODE_PORT;

app.disable('x-powered-by');
      
app.set('view-engine', 'ejs');

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(limiter);
app.use('/', routers);

app.listen(port);