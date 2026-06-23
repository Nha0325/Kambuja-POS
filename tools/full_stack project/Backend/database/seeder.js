const dotenv = require("dotenv")
dotenv.config()
const bcryptjs = require("bcryptjs")
const { connectToDatabase } = require("./db")
const User = require("../models/User.model")

const run = async () => {
    try {
        await connectToDatabase()
        const existSuper = await User.findOne({
            email: process.env.SUPER_EMAIL
        })
        const hashed = await bcryptjs.hash(process.env.SUPER_PASSWORD, 10)
        if(!existSuper){
            await new User({
                username: process.env.SUPER_USERNAME,
                email:process.env.SUPER_EMAIL,
                password: hashed,
                role: "super"
            }).save()
        }
        console.log('Seeding successfully!')
        process.exit(0)
    } catch (error) {
        console.error('Error during execution', error.message)
        process.exitCode = 1

    }
} 

run()