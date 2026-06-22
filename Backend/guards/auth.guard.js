const jwt = require("jsonwebtoken")
const User = require("../models/User.model")

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

      const user = await User.findById(payload.userId)

      if(!user || user.status === "INACTIVE"){
        return res.status(401).json({
            success: false,
            error: "Authentication Invalid: Account is unavailable!",
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
