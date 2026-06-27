const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/kambuja_pos")
  .then(async () => {
    const usersRes = await mongoose.connection.db.collection("users").updateMany(
      { email: { $in: ["pkayy@gmail.com", "nha@gmail.com"] } },
      { $set: { phone: "012345678" } }
    );
    console.log("Updated Users:", usersRes.modifiedCount);
    
    const shopsRes = await mongoose.connection.db.collection("shops").updateMany(
      { name: { $in: ["M", "Mark 24"] } },
      { $set: { billingPhone: "012345678" } }
    );
    console.log("Updated Shops:", shopsRes.modifiedCount);
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
