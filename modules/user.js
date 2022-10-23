if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const database = require('../modules/database'),
      crypto = require('crypto'),
      { verify } = require('jsonwebtoken'),
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
    const token =  req.headers['authorization']?.split(' ')[1];
    if (token == null) return res.redirect('error');
    verify(token, process.env.WEB_TOKEN, (error, udata) =>{
        if (error) return res.redirect('error');
        req.udata = udata;
        next();
    });
}

async function addToken(arg=null){
    query = `INSERT INTO login.tokens (data) VALUES ('${arg}')`;
    await database.sendQuery(query);
}

async function getToken(arg=null){
    if (arg == null) return false;
    query = `SELECT tokens.data FROM login.tokens WHERE tokens.data='${arg}'`;
    const [res, ] = await database.sendQuery(query);
    return res.data;
}

async function getToken(arg=null){
    if (arg == null) return false;
    query = `DELETE FROM tokens.data FROM login.tokens WHERE tokens.data='${arg}'`;
    const [res, ] = await database.sendQuery(query);
    return res.data;
}

module.exports = {
    addUser,
    getUsers,
    verifyUser,
    authUser,
    addToken,
    getToken,
}