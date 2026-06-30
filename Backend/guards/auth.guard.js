const jwt = require("jsonwebtoken")
const User = require('../models/users/User.model')

const authGuard = async (req, res, next) => {
    try {
      const authorization = req.get("authorization")
      const bearerToken = authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : null
      const token = req.cookies?.token || bearerToken
      if(!token){
        return res.status(401).json({
            success: false,
            error: "Authentication Invalid: No token provided!"
        })
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET)

      const user = await User.findById(payload.userId).select("+sessionToken")

      if(!user || user.status === "INACTIVE"){
        return res.status(401).json({
            success: false,
            error: "Authentication Invalid: Account is unavailable!",
        })
      }

      if (user.sessionToken && user.sessionToken !== token) {
        return res.status(401).json({
            success: false,
            error: "Session expired: You logged in on another device.",
        })
      }

      req.user = user

      next()
    
    } catch (error) {
        res.status(401).json({
            success: false,
            error: "Authentication Invalid: Token verification failed!"
        })
    }
}

module.exports = authGuard
