
/// Instead of using a try catch everywhere,
/// Gonna attempt to wrap functions in cartchErrors(),
// So that we catch them and pass them along with express' next

module.exports.catchErrors = (fn) => {
    return function (req, res, next) {
        return fn(req, res, next).catch((e) => {
            if (e.response) {
                e.status = e.response.status
            }
            next(e)
        })
    }
}