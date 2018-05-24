
var passport = require('passport');


class jwt_Auth {
    constructor () {
        this.auth = this.auth.bind(this)
    }

    auth (req, res, next) {
        passport.authenticate('jwt', {session:false});
        return next();
    }
}

module.exports = new jwt_Auth();