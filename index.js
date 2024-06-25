const express = require("express");
const mongoose = require("mongoose");
const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = "mongodb+srv://fukumasi:JU9PiGhLaRTdDlYs@cluster0.l1ibnnc.mongodb.net/yourDB?retryWrites=true&w=majority";

// MongoDB接続
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB connected...");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

// ミドルウェア
app.use(express.json());

// サンプルルート
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
