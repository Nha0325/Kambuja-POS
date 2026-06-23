const unsafeKeyPattern = /(^\$)|(\.)/

const sanitizeValue = (value) => {
    if (Array.isArray(value)) {
        value.forEach(sanitizeValue)
        return value
    }

    if (!value || typeof value !== "object") {
        return value
    }

    Object.keys(value).forEach((key) => {
        if (unsafeKeyPattern.test(key)) {
            delete value[key]
            return
        }

        sanitizeValue(value[key])
    })

    return value
}

const mongoSanitize = (req, res, next) => {
    sanitizeValue(req.body)
    sanitizeValue(req.query)
    sanitizeValue(req.params)
    next()
}

module.exports = mongoSanitize
