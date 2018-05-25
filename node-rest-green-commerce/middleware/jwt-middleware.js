
var passport = require('passport');


class jwt_Auth {
    // constructor () {
    //     this.auth = this.auth.bind(this)
    // }

    auth (req, res, next) {
        // const responseValue = {
        //     userObject : passport.authenticate('jwt', {session:false})
        // }
        // req.responseValue = responseValue
        // return next();
        passport.authenticate('jwt', {session:false})
    }
}

module.exports = new jwt_Auth();