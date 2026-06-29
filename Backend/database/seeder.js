require("../config/env")
const bcryptjs = require("bcryptjs")
const { connectToDatabase } = require("./db")
const User = require("../models/users/User.model")
const { ROLES } = require("../constants/roles")

const run = async () => {
    try {
        const requiredEnv = ["SUPER_USERNAME", "SUPER_EMAIL", "SUPER_PASSWORD"]
        const missingEnv = requiredEnv.filter((key) => !process.env[key])

        if(missingEnv.length > 0){
            throw new Error(`Missing required env values: ${missingEnv.join(", ")}`)
        }

        await connectToDatabase()
        const existSuper = await User.findOne({
            email: process.env.SUPER_EMAIL.trim().toLowerCase()
        })

        if(!existSuper){
            const hashed = await bcryptjs.hash(process.env.SUPER_PASSWORD, 10)
            await new User({
                username: process.env.SUPER_USERNAME.trim(),
                email: process.env.SUPER_EMAIL.trim().toLowerCase(),
                password: hashed,
                role: ROLES.ADMIN_MANAGER,
                shopId: null,
                status: "ACTIVE",
            }).save()
            console.log('Configured super user created.')
        }else{
            existSuper.role = ROLES.ADMIN_MANAGER
            existSuper.shopId = null
            existSuper.status = "ACTIVE"
            await existSuper.save()
            console.log('Configured super user already exists.')
        }

        process.exit(0)
    } catch (error) {
        console.error('Error during execution', error.message)
        process.exit(1)
    }
} 

run()
