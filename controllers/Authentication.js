if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const regex = {
          login    : /^[a-zA-Z0-9_-]{8,32}$/,
          password : /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,24}$/,
      };

const database = require('../models/Database'),
      crypto = require('crypto'),
      { verify } = require('jsonwebtoken');

async function verifyUser(user){
    if ((!user.login.match(regex.login)) || (!user.password.match(regex.password))) return false;
    const query = `SELECT users.password FROM login.users WHERE users.login='${user.login}'`,
          [res, ] = await database(query);
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
    if (refreshToken == null || token == null) return res.redirect('login');
    if (refreshToken != null && token == null) return res.redirect('api/token');
    verify(token, process.env.WEB_TOKEN, (error, udata) =>{
        if (error) return res.redirect('login');
        req.udata = udata;
        next();
    });
}

module.exports = {
    verifyUser,
    authUser,
}