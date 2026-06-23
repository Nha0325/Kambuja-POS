const bcryptjs = require("bcryptjs")
const User = require("../models/User.model")
const jwt = require("jsonwebtoken")
const { ROLES, normalizeRole } = require("../constants/roles")

exports.signup = async (req, res, next) => {
    try {
        
        if(!req.body.password){
            return res.status(400).json({
                success: false,
                error: "Password is required"
            })
        }
        const requesterRole = normalizeRole(req.user.role)
        const requestedRole = normalizeRole(req.body.role || ROLES.CASHIER)

        if(requesterRole !== ROLES.ADMIN || requestedRole !== ROLES.CASHIER){
            return res.status(403).json({
                success: false,
                error: "Admins can create cashier accounts only"
            })
        }

        const hashed = await bcryptjs.hash(req.body.password, 10)
        const newUser = await User.create({
            ...req.body,
            password: hashed,
            role: ROLES.CASHIER,
            shopId: req.user.shopId,
            status: "ACTIVE",
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

        if(typeof email !== "string" || typeof password !== "string" || !email.trim() || !password){
            return res.status(400).json({
                success: false,
                error: "Email and password must be valid strings."
            })

        }

        const normalizedEmail = email.trim().toLowerCase()
        const user = await User.findOne({email: normalizedEmail})
            .select("+password")
            .populate("shopId", "name code status")
        if(!user){
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            })

        }

        if(user.status === "INACTIVE" || user.shopId?.status === "INACTIVE"){
            return res.status(403).json({
                success: false,
                error: "This account is inactive",
            })
        }

        const isMatch = await bcryptjs.compare(password,user.password)
        if(!isMatch){
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
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
                role: normalizeRole(user.role),
                shopId: user.shopId,
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
            result: await req.user.populate("shopId", "name code status")
        })
    } catch (error) {
        next(error)
    }
}
