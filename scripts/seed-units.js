require("../Backend/config/env");
const mongoose = require("mongoose");
const Unit = require("../Backend/models/Unit.model");
const UnitConversionTemplate = require("../Backend/models/UnitConversionTemplate.model");

const unitsToSeed = [
    { nameKh: "រាយ", nameEn: "Piece", code: "PIECE", type: "BOTH" },
    { nameKh: "កេស", nameEn: "Case", code: "CASE", type: "BOTH" },
    { nameKh: "ដប", nameEn: "Bottle", code: "BOTTLE", type: "BOTH" },
    { nameKh: "កំប៉ុង", nameEn: "Can", code: "CAN", type: "BOTH" },
    { nameKh: "កញ្ចប់", nameEn: "Pack", code: "PACK", type: "BOTH" },
    { nameKh: "ប្រអប់", nameEn: "Box", code: "BOX", type: "BOTH" },
    { nameKh: "ឡូ", nameEn: "Dozen", code: "DOZEN", type: "BOTH" },
    { nameKh: "បាវ", nameEn: "Sack", code: "SACK", type: "BOTH" },
    { nameKh: "គីឡូក្រាម", nameEn: "Kilogram", code: "KG", type: "BOTH" },
    { nameKh: "ក្រាម", nameEn: "Gram", code: "G", type: "BOTH" }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected for seeding");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

const seed = async () => {
    await connectDB();

    for (let u of unitsToSeed) {
        await Unit.findOneAndUpdate({ code: u.code }, u, { upsert: true, new: true });
    }
    console.log("Units seeded successfully");

    const getUnitId = async (code) => {
        const u = await Unit.findOne({ code });
        return u._id;
    };

    const templates = [
        { templateName: "1 កេស = 24 រាយ", purchaseUnit: await getUnitId("CASE"), baseUnit: await getUnitId("PIECE"), unitsPerPurchaseUnit: 24 },
        { templateName: "1 ឡូ = 12 រាយ", purchaseUnit: await getUnitId("DOZEN"), baseUnit: await getUnitId("PIECE"), unitsPerPurchaseUnit: 12 },
        { templateName: "1 ប្រអប់ = 10 រាយ", purchaseUnit: await getUnitId("BOX"), baseUnit: await getUnitId("PIECE"), unitsPerPurchaseUnit: 10 },
        { templateName: "1 បាវ = 50 គីឡូក្រាម", purchaseUnit: await getUnitId("SACK"), baseUnit: await getUnitId("KG"), unitsPerPurchaseUnit: 50 },
        { templateName: "1 គីឡូក្រាម = 1000 ក្រាម", purchaseUnit: await getUnitId("KG"), baseUnit: await getUnitId("G"), unitsPerPurchaseUnit: 1000 },
    ];

    for (let t of templates) {
        await UnitConversionTemplate.findOneAndUpdate({ templateName: t.templateName }, t, { upsert: true, new: true });
    }
    console.log("Templates seeded successfully");

    mongoose.connection.close();
    console.log("Done.");
};

seed();
