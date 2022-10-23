if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const express = require('express'),
      { createHash } = require('./modules/hashing'),
      { sign, verify } = require('jsonwebtoken'),
      { addUser, verifyUser, authUser, getUsers, getToken, addToken, removeToken } = require('./modules/user'),
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
            const webToken = sign({ result : req.body.email }, process.env.WEB_TOKEN, { expiresIn: '15s' });
            const refreshToken = sign({ result : req.body.email }, process.env.REFRESH_TOKEN);
            addToken(refreshToken);
            res.json(
                {
                    success: 1,
                    message: `Successfully fetched user.`,
                    token: webToken,
                    refresh: refreshToken,
                }
            );
        }
        else res.redirect('../login');
    }
    catch (error) {
        console.log(error);
    }
});

app.get('/api/token', async (req, res)=>{
    const refreshToken = req.body.refresh;
    if (refreshToken === undefined) return;
    const token = await getToken(refreshToken);
    if (token === false) res.redirect('../error');
    if (token === refreshToken) {
        verify(refreshToken, process.env.REFRESH_TOKEN, (error, udata) =>{
            if (error) return res.redirect('error');
            req.udata = udata;
            const newWebToken = sign({ result : req.body.email }, process.env.WEB_TOKEN, { expiresIn: '15s' });
            res.json(
                {
                    success: 1,
                    message: `Successfully refreshed token.`,
                    token: newWebToken,
                });
        });
    }
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

app.delete('/logout', async (req, res)=>{
    const refreshToken = req.body.refresh;
    if (removeToken(refreshToken)) res.redirect('login');
    else res.redirect('error');
});

app.get('/error', (req, res)=>{
    res.render('error.ejs');
});

app.listen(port);