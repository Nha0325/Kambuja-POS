const jwt = require("jsonwebtoken")
const User = require("../models/User.model")

const authGuard = async (req, res, next) => {
    try {
      const token = req.cookies?.token
      if(!token){
        return res.status(401).json({
            success: false,
            error: "Authentication Invalid: No token provided!"
        })
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET)

      const user = await User.findById(payload.userId)

      req.user = user

      next()
    
    } catch (error) {
        res.status(401).json({
            success: false,
            error: "Authentication Invalid: Token verrification failed!"
        })
    }
}

module.exports = authGuard