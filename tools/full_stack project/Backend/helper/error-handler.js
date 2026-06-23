

const errorHandler = (err, req, res, next) => {
    let statusCode = 500
    let errMessage = "Server Error!"

    if(err.name === "ValidationError"){
        const errors = Object.values(err.errors).map(el => {
            return{
                path: el.path,
                message: el.message
            }
        })
        statusCode = 400
        errMessage = errors
    }

    // Handle Mongoose Cast Error (e.g., Invalid ObjectID)
    if (err.name === 'CastError') {
        statusCode = 400;
        errMessage = `Invalid ${err.path}: ${err.value}.`;
    }

    // Handle Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        statusCode = 409;
        errMessage = `Conflict: A record with this ${field} already exists.`;
    }

    if(process.env.NODE_ENV === "development"){
        res.status(statusCode).json({
            success: false,
            name: err.name,
            stack: err.stack,
            error: errMessage
        })
    }
    else{
        res.status(statusCode).json({
            success: false,
            message: errMessage,
            error: errMessage
        })
    }
}
module.exports = errorHandler
