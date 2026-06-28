const { default: mongoose } = require("mongoose");


const schema = new mongoose.Schema({
    _id: String,
    sequence_value: Number

})

const Counter = mongoose.model("Counter", schema)

module.exports = Counter