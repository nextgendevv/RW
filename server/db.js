const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ DB Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ DB Connection Error:", err));