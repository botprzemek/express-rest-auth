if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const express = require('express'),
      passport = require('passport'),
      { createHash } = require('./modules/hashing'),
      { addUser } = require('./modules/user'),
      { initialize } = require('./modules/passport'),
      session = require('express-session'),
      flash = require('express-flash'),
      app = express(),
      port = process.env.NODE_PORT,
      users = [];

initialize(
    passport,
    email => users.find(u => u.email === email),
    id => users.find(u => u.id === id),
);

app.set('view-engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res)=>{
    res.render('login.ejs');
});

app.post('/api/login', (req, res)=>{
    console.table(req.body);
});// passport.authenticate('local', {
//     successRedirect: '../panel',
//     failureRedirect: '../login',
//     failureFlash: true,
// } 
// ));

app.get('/register', (req, res)=>{
    res.render('register.ejs');
});

app.post('/api/register', (req, res)=>{
    try {
        const user = createHash(req.body.email, req.body.login, req.body.password);
        addUser(user);
        res.redirect('../login');
    }
    catch {
       res.redirect('../register');
    }
});

app.get('/panel', (req, res)=>{
    res.render('panel.ejs');
});

app.get('/api/users', (req, res)=>{
    res.json(users);
});

app.listen(port);