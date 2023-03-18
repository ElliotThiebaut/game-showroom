//Extending the default Error class
export class ApiError extends Error {
    constructor(message, logMessage, status, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = status;
        this.logMessage = logMessage
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class AuthError extends Error {
    constructor() {
        super();
        this.message = 'Insufficient  permission to access this route'
        this.statusCode = 403;
        this.status = 'insufficient-permission';
        this.logMessage = 'Insufficient permissions'
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = async (err, req, res, next) => {
    // Defining default values if none are passed
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.logMessage = err.logMessage || 'An error occurred';
    res.locals.user = res.locals.user || 'Unknown';

    // Logging error to console
    console.log(`(${res.locals.user}) ${err.logMessage} in ${req.originalUrl} :`)
    console.log(err)

    // Sending error to client
    res.status(parseInt(err.statusCode)).json({
        status: err.status,
        message: err.message
    });
}