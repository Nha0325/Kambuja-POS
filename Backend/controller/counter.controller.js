const Counter = require("../models/Counter.model")

exports.generateProductCode = async (session = null) => {
    const result = await Counter.findOneAndUpdate(
        {_id: "product_code"},
        {$inc: {sequence_value: 1}},
        {returnDocument: 'after', upsert: true, ...(session ? { session } : {})}
    )
    const productCode = String(result.sequence_value).padStart(6, '0')
    return productCode
}

exports.generateInvoiceNumber = async (session = null) => {
    const result = await Counter.findOneAndUpdate(
        {_id: "invoice_number"},
        {$inc: {sequence_value: 1}},
        {returnDocument: 'after', upsert: true, ...(session ? { session } : {})}
    )
    if (!result) {
        throw new Error("Failed to generate invoice number: Counter document not found or created.");
    }
    const invoiceNumber = String(result.sequence_value).padStart(6, '0')
    return invoiceNumber
}

exports.generateShopCode = async (session = null) => {
    const result = await Counter.findOneAndUpdate(
        { _id: "shop_code" },
        { $inc: { sequence_value: 1 } },
        { returnDocument: 'after', upsert: true, ...(session ? { session } : {}) }
    )
    if (!result) {
        throw new Error("Failed to generate shop code: Counter document not found or created.");
    }
    return `SHOP-${String(result.sequence_value).padStart(6, '0')}`
}
