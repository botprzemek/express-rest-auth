const { scryptSync, randomBytes } = require('crypto');

function createHash(email, login, password, group=2){
    const salt = randomBytes(16).toString('hex'), 
          hashedPassword = scryptSync(password, salt, 64).toString('hex');
    return {
        login    : login.toLowerCase(),
        password : `${salt}:${hashedPassword}`,
        email    : email.toLowerCase(),
        group    : group,
    }
}

module.exports = { createHash }