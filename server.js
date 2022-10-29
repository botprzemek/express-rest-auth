if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express'),
      cookieParser = require('cookie-parser'),
      app = express(),
      routers = require('./routes/User');
      port = process.env.NODE_PORT;

app.set('view-engine', 'ejs');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', routers);

app.listen(port);