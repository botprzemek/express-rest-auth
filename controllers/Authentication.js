if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const database = require('../models/Database'),
      crypto = require('crypto'),
      { verify } = require('jsonwebtoken'),
      { logUser } = require('../controllers/Database'),
      regex = {
        login    : /^[a-zA-Z0-9_-]{8,32}$/,
        password : /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,24}$/,
      };

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
    const token = req.cookies['token'],
          refreshToken = req.cookies['refreshToken'];
    if (refreshToken == null && token == null) return res.redirect('./../../welcome');
    if (refreshToken != null && token == null) return res.redirect('./api/token');
    if (typeof token !== 'string' || typeof refreshToken !== 'string' || typeof req.cookies['user'] !== 'string'){
        res.cookie('token', '', { maxAge: -90000, secure: true, sameSite: 'lax', httpOnly: true });
        res.cookie('refreshToken', '', { maxAge: -90000, secure: true, sameSite: 'lax', httpOnly: true });
        res.cookie('user', '', { maxAge: -90000, secure: true, sameSite: 'lax', httpOnly: true });
        return res.redirect('./../../welcome');
    }
    if (JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).result !== req.cookies['user']){
        res.cookie('token', '', { maxAge: -90000, secure: true, sameSite: 'lax', httpOnly: true });
        res.cookie('refreshToken', '', { maxAge: -90000, secure: true, sameSite: 'lax', httpOnly: true });
        res.cookie('user', '', { maxAge: -90000, secure: true, sameSite: 'lax', httpOnly: true });
        return res.redirect('./../../welcome');
    }
    verify(token, process.env.WEB_TOKEN, async (error, udata) =>{
        if (error) {
            await logUser({
                login: req.cookies['user'],
                data: `User ${req.cookies['user']} tried to change cookies.`,
            });
            res.cookie('token', '', { maxAge: -90000, secure: true, sameSite: 'lax', httpOnly: true });
            res.cookie('refreshToken', '', { maxAge: -90000, secure: true, sameSite: 'lax', httpOnly: true });
            res.cookie('user', '', { maxAge: -90000, secure: true, sameSite: 'lax', httpOnly: true });
            return res.redirect('./../../welcome');
        }
        req.udata = udata;
        next();
    });
}

module.exports = {
    verifyUser,
    authUser,
}