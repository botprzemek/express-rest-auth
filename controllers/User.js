const { logUser } = require('../controllers/Database');

async function logoutUser(req, res) {
    await logUser({
        login: req.cookies['user'],
        data: `User ${req.cookies['user']} logged out.`,
    });
    res.cookie('token', '', { maxAge: -90000, httpOnly: true });
    res.cookie('refreshToken', '', { maxAge: -90000, httpOnly: true });
    res.cookie('user', '', { maxAge: -90000, httpOnly: true });
    res.redirect('./welcome');
};

module.exports = {
    logoutUser,
}