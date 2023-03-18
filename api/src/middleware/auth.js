import {ApiError, AuthError} from "./error.js";

export class Auth {
    static ensureRole(roles) {
        return async (req, res, next) => {
            let key = ""
            if (!req.headers.authorization) {
                return next(new ApiError('Missing API Key', 'Missing API Key for the request', 'missing-auth', 401))
            } else {
                key = req.headers.authorization.slice(4)
            }


            if (key === process.env.VITE_DB_GATHERING_KEY && roles.includes('gathering-database')) {
                res.locals.user = 'Client app'
                res.locals.permissions = ['gathering-database']
            } else if (key === process.env.DB_GATHERING_ADMIN_KEY) {
                res.locals.user = 'Admin app'
                res.locals.permissions = ['gathering-admin-database', 'gathering-database']
            } else {
                return next(new AuthError())
            }

            return next()

        }
    }
}