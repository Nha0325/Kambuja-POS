const bcryptjs = require("bcryptjs")
const User = require("../models/User.model")
const jwt = require("jsonwebtoken")
exports.signup = async (req, res, next) => {
    try {
        
        if(!req.body.password){
            return res.status(400).json({
                success: false,
                error: "Password is required"
            })
        }
        if(req.user.role  !== "super" && req.body.role == "admin"){
            return res.status(403).json({
                success: false,
                error: "Only super users can create admin account!"
            })
        }

        const hashed = await bcryptjs.hash(req.body.password, 10)
        const newUser = await User.create({
            ...req.body,
            password:hashed
        })

        newUser.password = undefined
        
        res.status(201).json({
            success: true,
            result: newUser
        })
    } catch (error) {
        next(error)
    }
}

exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body || {}

        if(!email || !password){
            return res.status(400).json({
                success: false,
                error: "username email and password are required!"
            })

        }

        const user = await User.findOne({email}).select("+password")
        if(!user){
            return res.status(404).json({
                success: false,
                error: "Unauthorization"
            })

        }

        const isMatch = await bcryptjs.compare(password,user.password)
        if(!isMatch){
            return res.status(401).json({
                success: false,
                error: "Password does not match!"
            })
        }
 
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_LIFETIME
        })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV == "production",
            maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
            domain: process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN : "localhost",
            sameSite: process.env.COOKIE_SAMESITE
        })

        res.status(200).json({
            success: true,
            result:{
                username: user.username,
                email: user.email,
                role: user.role,
                token: token
            }
        })
    } catch (error) {
        next(error)
    }
}

exports.signout = async (req, res, next) => {
    try {
        if(!req.user){
            return res.status(401).json({
                success: false,
                error: "Unauthorization"
            })
        }

        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV == "production",
            maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
            domain: process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN : "localhost",
            sameSite: process.env.COOKIE_SAMESITE
        })
        res.status(200).json({
            success: true,
            message: "Signout successfully!"
        })
    } catch (error) {
        next(error)
    }
}

exports.me = async (req, res, next) => {
    try {
        if(!req.user){
            return res.status(401).json({
                success: false,
                error: "Unauthorization"
            })
        }

        res.status(200).json({
            success: true,
            result: req.user
        })
    } catch (error) {
        next(error)
    }
}