const { scryptSync, randomBytes } = require('crypto');

function createHash(login, email, password){
    const salt = randomBytes(16).toString('hex'), 
          hashedPassword = scryptSync(password, salt, 64).toString('hex');
    return {
        login    : login.toLowerCase(),
        password : `${salt}:${hashedPassword}`,
        email    : email.toLowerCase(),
    }
}

module.exports = createHash