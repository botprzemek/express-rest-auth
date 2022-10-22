const localStrategy = require('passport-local').Strategy,
      { scryptSync, timingSafeEqual } = require('crypto');

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = (email, password, done) => {
        const user = getUserByEmail(email);
        if (user === null) return done(null, false, { message: 'No user found.'});
        try {
            const [salt, key] = user.password.split(':'),
                  hashedBuffer = scryptSync(password, salt, 64),
                  keyBuffer = Buffer.from(key, 'hex'),
                  match = timingSafeEqual(hashedBuffer, keyBuffer);
            if (match) done(null, user, { message: 'Logged successfuly.'});
            else return done(null, false, { message: 'Wrong password.'});
        }
        catch (error) {
            return done(error);
        }
    };
    passport.use(new localStrategy({ usernameField: 'email' },  authenticateUser));
    passport.serializeUser((user, done) => { done (null, id) });
    passport.deserializeUser((id, done) => { return done(null, getUserById(id)); }); 
}

module.exports = {
    initialize
}