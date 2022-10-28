if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const database = require('./database'),
      crypto = require('crypto'),
      { verify } = require('jsonwebtoken'),
      regex = {
        login    : /^[a-zA-Z0-9_@]{8,32}$/,
        email    : /([A-Z]|[a-z]|[^<>()\[\]\\\/.,;:\s@"]){4,}\@([A-Z]|[a-z]|[^<>()\[\]\\\/.,;:\s@"]){4,}\.(com|net)/,
        password : /^([a-zA-Z0-9@*#_!]{8,24})$/,
      };

async function logUser(log){
    const query = `INSERT INTO login.logs (logs.uid, logs.data) VALUES ((SELECT users.uid FROM login.users WHERE users.login='${log.login}'), '${log.data}')`;
    res = await database.sendQuery(query);
    if (res) return true;
    else return false;
}


async function addUser(user){
    if ((!user.login.match(regex.login)) || (!user.email.match(regex.email)) || (!user.password.match(regex.password))) return false;
    const query = `INSERT INTO login.users (login, email, password) VALUES ('${user.login}', '${user.email}', '${user.password}')`,
    res = await database.sendQuery(query);
    if (res) return true;
    else return false;
}

async function verifyUser(user){
    const query = `SELECT users.password FROM login.users WHERE users.login='${user.login}'`,
          [res, ] = await database.sendQuery(query);
    if (res === undefined) return false;
    const [salt, key] = res.password.split(':'),
          hashedBuffer = crypto.scryptSync(user.password, salt, 64),
          keyBuffer = Buffer.from(key, 'hex'),
          match = crypto.timingSafeEqual(hashedBuffer, keyBuffer);
    return match;
}

function authUser(req, res, next){
    const token = req.cookies['token'];
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken == null) return next();
    if (refreshToken != null && token == null) return res.redirect('api/token');
    else if (token == null) return res.redirect('login');
    verify(token, process.env.WEB_TOKEN, (error, udata) =>{
        if (error) return res.redirect('login');
        req.udata = udata;
        next();
    });
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

module.exports = {
    addUser,
    getUsers,
    verifyUser,
    authUser,
    logUser,
}