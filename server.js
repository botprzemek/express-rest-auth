if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const express = require('express'),
      { createHash } = require('./modules/hashing'),
      { sign } = require('jsonwebtoken'),
      { addUser, verifyUser, authUser, getUsers, getToken } = require('./modules/user'),
      app = express(),
      port = process.env.NODE_PORT;

app.set('view-engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/login', (req, res)=>{
    res.render('login.ejs');
});

app.post('/api/login', async (req, res)=>{
    try {
        const user = { email: req.body.email, password: req.body.password },
              status = await verifyUser(user);
        if (status == true) {
            const webToken = sign({ result : req.body.email }, process.env.WEB_TOKEN, { expiresIn: '30m' });
            const refreshToken = sign({ result : req.body.email }, process.env.REFRESH_TOKEN);
            res.json(
                {
                    success: 1,
                    message: `Successfully fetched user.`,
                    token: webToken,
                    refresh: refreshToken,
                }
            );
            res.redirect('../panel');
        }
        else res.redirect('../login');
    }
    catch (error) {
        console.log(error);
    }
});

app.get('/api/token', async (req, res)=>{
    const refreshToken = req.body.token,
          tokens = await getToken();
    if (tokens.includes(refreshToken));
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

app.get('/panel', authUser, (req, res)=>{
    res.render('panel.ejs');
});

app.get('/api/users', async (req, res)=>{
    res.json(
        {
            success: 1,
            message: `Successfully fetched users.`,
            data: await getUsers(),
        }
    );
});

app.get('/api/users/:id', async (req, res)=>{
    const get = await getUsers(req.params.id);
    if (get.length == 0 || get == false) res.redirect('../../error');
    else res.json(
        {
            success: 1,
            message: `Successfully fetched user.`,
            data: get,
        }
    );
});

app.get('/error', (req, res)=>{
    res.render('error.ejs');
});

app.listen(port);