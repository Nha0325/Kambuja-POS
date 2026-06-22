const User = require("../models/User.model")
const bcryptjs = require("bcryptjs")
const { ROLES, normalizeRole } = require("../constants/roles")

exports.findAll = async (req, res, next) => {
    try {
        const page = req.query.page * 1 || 1
        const limit = req.query.limit * 1 || 10
        const skip = (page - 1) * limit
        const querySearch = {}

        if(req.query.search){
            querySearch["$or"] = [
                {username:{  $regex: req.query.search, $options: "i" }},
                {email: {  $regex: req.query.search, $options: "i" }}
            ]
        }

        const docs = await User
                            .find({
                                ...querySearch,
                                role: ROLES.CASHIER,
                                shopId: req.user.shopId,
                                email: {$ne: req.user.email}
                            })
                            .skip(skip) 
                            .limit(limit)
                            .sort({_id: -1})
                            .exec()

        const totalItems = await User.find({
            ...querySearch,
            role: ROLES.CASHIER,
            shopId: req.user.shopId,
            email: {$ne: req.user.email}
        }).countDocuments()
        const totalPage = Math.ceil(totalItems / limit)

        res.status(200).json({
            success: true,
            totalPage,
            result: docs,
        })
    } catch (error) {
        next(error)
    }
}

exports.findOne = async (req, res, next) => {
    try {
        const id = req.params.id
        const doc =await User.findOne({
            _id: id,
            role: ROLES.CASHIER,
            shopId: req.user.shopId,
        })
        if(!doc){
            return res.status(404).json({
                success: false,
                error: "Document not found with that ID!"
            })
        }
        res.status(200).json({
            success: true,
            result: doc
        })
    } catch (error) {
        next(error)
    }
}

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id
        const {password} = req.body
        let hashed = ""

        if(req.body.role && normalizeRole(req.body.role) !== ROLES.CASHIER){
            return res.status(403).json({
                success: false,
                error:"Admins can manage cashier accounts only"
            })
        }

        if(password){
            hashed = await bcryptjs.hash(password, 10)
            req.body.password = hashed
        }

        const doc = await User.findOneAndUpdate(
            { _id: id, role: ROLES.CASHIER, shopId: req.user.shopId },
            {
                ...req.body,
                role: ROLES.CASHIER,
                shopId: req.user.shopId,
            },
            { new: true, runValidators: true }
        )
        if(!doc){
            return res.status(404).json({
                success: false,
                error: "User not found!"
            })
        }

        return res.status(200).json({
            success: true,
            result: doc
        })

    } catch (error) {
        next(error)
    }
}

exports.remove = async (req, res, next) => {
    try {
        const id = req.params.id
        const doc = await User.findOne({
            _id: id,
            role: ROLES.CASHIER,
            shopId: req.user.shopId,
        })
        if(!doc){
            return res.status(404).json({
                success: false,
                error: "Document not found with that ID!"
            })
        }

        await doc.deleteOne()

        res.status(200).json({
            success: true,
            result: "User deleted successfully"
        })
    } catch (error) {
        next(error)
    }
}
