const database = require('../models/Database'),
      createHash = require('../models/Hashing'),
      regex = {
        login    : /^[a-zA-Z0-9_-]{8,32}$/,
        email    : /^((?!\.)[\w_.-]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/,
        password : /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,24}$/,
      };

async function logUser(log){
    const query = `INSERT INTO login.logs (logs.uid, logs.data) VALUES ((SELECT users.uid FROM login.users WHERE users.login='${log.login}'), '${log.data}')`;
    res = await database(query);
    if (res) return true;
    else return false;
}

async function addUser(user){
    if ((!user.login.match(regex.login)) || (!user.email.match(regex.email)) || (!user.password.match(regex.password))) return false;
    const hashed = createHash(user.login, user.email, user.password);
    const query = `INSERT INTO login.users (login, email, password) VALUES ('${hashed.login}', '${hashed.email}', '${hashed.password}')`,
    res = await database(query);
    if (res) return true;
    else return false;
}

async function getUsers(arg=null){
    if (arg == null) {
        query = `SELECT * FROM login.users`;
        return [res, ] = await database(query);
    }
    else if (isNaN(arg)) {
        query = `SELECT * FROM login.users WHERE users.login='${arg}'`;
        return [res, ] = await database(query);
    }
    else query = `SELECT * FROM login.users WHERE users.uid=${arg}`;
    return [res, ] = await database(query);
}

module.exports = {
    addUser,
    getUsers,
    logUser,
}