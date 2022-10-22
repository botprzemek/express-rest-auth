const database = require('../modules/database');

async function addUser(user){
    if (user.login.match('/^[a-zA-Z0-9_]{6,24}$/')) {
        const query = `INSERT INTO login.users (login, email, password) VALUES ('${user.login}', '${user.email}', '${user.password}')`,
              res = await database.sendQuery(query);
        return res;
    }// || (!user.email.match('/^[a-zA-Z0-9_@]{8,32}$/'))) return;
}

module.exports = {
    addUser,
}