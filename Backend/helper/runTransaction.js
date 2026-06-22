const mongoose = require("mongoose")

let transactionSupport

const supportsTransactions = async () => {
    if (transactionSupport !== undefined) return transactionSupport

    const hello = await mongoose.connection.db.admin().command({ hello: 1 })
    transactionSupport = Boolean(hello.setName || hello.msg === "isdbgrid")
    return transactionSupport
}

const runTransaction = async (work) => {
    if (!(await supportsTransactions())) {
        return work(null)
    }

    const session = await mongoose.startSession()
    let result
    try {
        await session.withTransaction(async () => {
            result = await work(session)
        })
        return result
    } finally {
        await session.endSession()
    }
}

module.exports = runTransaction
