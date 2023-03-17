import {client} from "../db-connexion.js";
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

            const dbUser = await client.db('auth').collection('users').findOne({secretKey: key})

            if (!dbUser) {
                return next(new ApiError('Invalid API Key', 'Invalid API Key for the request', 'invalid-auth', 401))
            } else {
                if (roles && !dbUser.permission.includes('admin')) {
                    for (let role of roles) {
                        if (!dbUser.permission.includes(role)) {
                            return next(new AuthError())
                        }
                    }
                }

                res.locals.user = dbUser.name
                res.locals.permissions = dbUser.permission
                return next()
            }
        }
    }
}