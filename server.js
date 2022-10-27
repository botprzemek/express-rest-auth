if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express'),
      { createHash } = require('./modules/hashing'),
      { sign, verify } = require('jsonwebtoken'),
      { addUser, verifyUser, authUser, getUsers } = require('./modules/user'),
      cookieParser = require('cookie-parser'),
      app = express(),
      port = process.env.NODE_PORT,
      age = 1000*3600*24*7;

app.set('view-engine', 'ejs');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/login', (req, res)=>{
    res.render('login.ejs');
});

app.post('/api/login', async (req, res, next)=>{
    try {
        const user = { email: req.body.email, password: req.body.password },
              status = await verifyUser(user);
        if (status == true) {
            const webToken = sign({ result : req.body.email }, process.env.WEB_TOKEN, { expiresIn: '15m' });
            const refreshToken = sign({ result : req.body.email }, process.env.REFRESH_TOKEN);
            res.cookie('token', webToken, { maxAge: 150000, httpOnly: true });
            res.cookie('refreshToken', refreshToken, { maxAge: age, httpOnly: true });
            res.cookie('user', req.body.email, { maxAge: age, httpOnly: true });
            res.redirect('./../');
        }
        else res.redirect('./../login');
    }
    catch (error) {
        console.log(error);
    }
});

app.get('/api/token', async (req, res)=>{
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken === null) res.redirect('./../login');
    verify(refreshToken, process.env.REFRESH_TOKEN, (error, udata) =>{
        if (error) return res.redirect('./../login');
        req.udata = udata;
        const newWebToken = sign({ result : req.cookies['user'] }, process.env.WEB_TOKEN, { expiresIn: '15m' });
        res.cookie('token', newWebToken, { maxAge: 150000, httpOnly: true });
        res.redirect('./../');
    });
});

app.get('/register', (req, res)=>{
    res.render('register.ejs');
});

app.post('/api/register', (req, res)=>{
    try {
        const user = createHash(req.body.email, req.body.login, req.body.password);
        if (addUser(user) == true) res.redirect('../login');
        else res.redirect('../register');
    }
    catch {
       res.redirect('../register');
    }
});

app.get('/', authUser, (req, res)=>{
    res.render('panel.ejs');
});

app.get('/api/users', async (req, res)=>{
    res.json(await getUsers());
});

app.get('/api/users/:id', async (req, res)=>{
    const get = await getUsers(req.params.id);
    if (get.length == 0 || get == false) res.redirect('../../error');
    else res.json(get);
});

app.get('/logout', async (req, res)=>{
    res.cookie('token', '', { maxAge: -90000, httpOnly: true });
    res.cookie('refreshToken', '', { maxAge: -90000, httpOnly: true });
    res.cookie('user', '', { maxAge: -90000, httpOnly: true });
    res.redirect('login');
});

app.get('/error', (req, res)=>{
    res.render('error.ejs');
});

app.listen(port);