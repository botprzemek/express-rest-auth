const express = require('express'),
      router = express.Router(),
      { authUser } = require('../controllers/Authentication'),
      { apiLogin, apiRegister, apiToken, apiUsers, apiUserId } = require('../controllers/Api'),
      { logoutUser } = require('../controllers/User');

router.use((req, res, next) => { next() })
router.get('/', (req, res)=>{ res.redirect('panel') });

router.get('/panel', authUser, (req, res)=>{ res.render('Panel.ejs') });
router.get('/login', (req, res)=>{ res.render('Login.ejs') });
router.get('/register', (req, res)=>{ res.render('Register.ejs') });

router.get('/logout', logoutUser);

router.post('/api/login', apiLogin);
router.post('/api/register', apiRegister);
router.get('/api/token', apiToken);
router.get('/api/users', apiUsers);
router.get('/api/users/:id', apiUserId);

module.exports = router