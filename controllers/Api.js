const { sign, verify } = require('jsonwebtoken'),
      { addUser, getUsers, logUser } = require('./Database'),
      { verifyUser } = require('./Authentication'),
      age = 1000*3600*24*7;

async function apiLogin(req, res){
    try {
        const user = { login: req.body.login, password: req.body.password },
              status = await verifyUser(user);
        if (status == true) {
            await logUser({
                login: user.login,
                data: `User ${user.login} logged successfully.`,
            });
            const webToken = sign({ result : req.body.login }, process.env.WEB_TOKEN, { expiresIn: '15m' });
            const refreshToken = sign({ result : req.body.login }, process.env.REFRESH_TOKEN, { expiresIn: '7d' });
            res.cookie('token', webToken, { maxAge: 150000, httpOnly: true });
            res.cookie('refreshToken', refreshToken, { maxAge: age, httpOnly: true });
            res.cookie('user', req.body.login, { maxAge: age, httpOnly: true });
            res.redirect('./../panel');
        }
        else {
            await logUser({
                login: user.login,
                data: `User ${user.login} login failed.`,
            });
            res.redirect('./../login');
        }
    }
    catch (error) {
        console.log(error);
    }
}

async function apiRegister(req, res){
    try {
        const user = { 
            login: req.body.login,
            email: req.body.email, 
            password:req.body.password,
        };
        
        if (await addUser(user) == true) res.redirect('../login');
        else res.redirect('../register');
    }
    catch {
       res.redirect('../register');
    }
}

async function apiToken(req, res){
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken === null) res.redirect('./../login');
    verify(refreshToken, process.env.REFRESH_TOKEN, (error, udata) =>{
        if (error) return res.redirect('./../login');
        req.udata = udata;
        const newWebToken = sign({ result : req.cookies['user'] }, process.env.WEB_TOKEN, { expiresIn: '15m' });
        res.cookie('token', newWebToken, { maxAge: 150000, httpOnly: true });
        res.redirect('./../panel');
    });
}

async function apiUsers(req, res){
    res.json(await getUsers());
}

async function apiUserId(req, res){
    const get = await getUsers(req.params.id);
    if (get.length == 0 || get == false) res.redirect('./../../');
    else res.json(get);
}

module.exports = {
    apiLogin,
    apiRegister,
    apiToken,
    apiUsers,
    apiUserId,
}