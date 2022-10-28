if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const database = require('./database'),
      crypto = require('crypto'),
      { sign, verify } = require('jsonwebtoken'),
      age = 150000,
      regex = {
        login    : /^[a-zA-Z0-9_@]{8,32}$/,
        email    : /([A-Z]|[a-z]|[^<>()\[\]\\\/.,;:\s@"]){4,}\@([A-Z]|[a-z]|[^<>()\[\]\\\/.,;:\s@"]){4,}\.(com|net)/,
        password : /^([a-zA-Z0-9@*#_!]{8,24})$/,
      };

async function addUser(user){
    if ((!user.login.match(regex.login)) || (!user.email.match(regex.email)) || (!user.password.match(regex.password))) return false;
    const query = `INSERT INTO login.users (login, email, password) VALUES ('${user.login}', '${user.email}', '${user.password}')`,
          res = await database.sendQuery(query);
    return true;
}

async function verifyUser(user){
    const query = `SELECT users.password FROM login.users WHERE users.email='${user.email}'`,
          [res, ] = await database.sendQuery(query),
          [salt, key] = res.password.split(':'),
          hashedBuffer = crypto.scryptSync(user.password, salt, 64),
          keyBuffer = Buffer.from(key, 'hex'),
          match = crypto.timingSafeEqual(hashedBuffer, keyBuffer);
    return match;
}

async function getUsers(arg=null){
    if (arg == null) {
        query = `SELECT * FROM login.users`;
        return [res, ] = await database.sendQuery(query);
    }
    else if (isNaN(arg)) {
        query = `SELECT * FROM login.users WHERE users.login='${arg}'`;
        return [res, ] = await database.sendQuery(query);
    }
    else query = `SELECT * FROM login.users WHERE users.uid=${arg}`;
    return [res, ] = await database.sendQuery(query);
}

function authUser(req, res, next){
    const token = req.cookies['token'];
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken != null && token == null) return res.redirect('api/token');
    else if (token == null) return res.redirect('login');
    verify(token, process.env.WEB_TOKEN, (error, udata) =>{
        if (error) return res.redirect('login');
        req.udata = udata;
        next();
    });
}

async function checkToken(req, res){
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken === undefined) return;
    const token = await getToken(refreshToken);
    if (token === false) res.redirect('error');
    if (token === refreshToken) {
        verify(refreshToken, process.env.REFRESH_TOKEN, (error, udata) =>{
            if (error) return res.redirect('error');
            req.udata = udata;
            const newWebToken = sign({ result : req.body.email }, process.env.WEB_TOKEN, { expiresIn: '15m' });
            res.cookie('token', newWebToken, { maxAge: age, httpOnly: true });
        });
    }
}

module.exports = {
    addUser,
    getUsers,
    verifyUser,
    authUser,
    checkToken,
}