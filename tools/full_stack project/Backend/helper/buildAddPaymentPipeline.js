const buildAddPaymentPipeline = (additionalPaid) => [
    {
        $set: {
            paidAmount: {
                $add: [{ $ifNull: ["$paidAmount", 0] }, additionalPaid]
            }
        }
    },
    {
        $set: {
            dueAmount: {
                $max: [0, { $subtract: [{ $ifNull: ["$totalCost", 0] }, "$paidAmount"] }]
            },
            changeAmount: {
                $max: [0, { $subtract: ["$paidAmount", { $ifNull: ["$totalCost", 0] }] }]
            },
            paymentStatus: {
                $switch: {
                    branches: [
                        {
                            case: { $lte: [{ $ifNull: ["$totalCost", 0] }, 0] },
                            then: "paid"
                        },
                        {
                            case: { $lte: ["$paidAmount", 0] },
                            then: "due"
                        },
                        {
                            case: { $gte: ["$paidAmount", { $ifNull: ["$totalCost", 0] }] },
                            then: "paid"
                        }
                    ],
                    default: "partial"
                }
            }
        }
    }
]

module.exports = buildAddPaymentPipeline
