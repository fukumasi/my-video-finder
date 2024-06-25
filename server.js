const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const Item = require("./models/Item"); // 未使用のため削除
const itemRoutes = require("./routes/items");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb+srv://fukumasi:JU9PiGhLaRTdDlYs@cluster0.l1ibnnc.mongodb.net/yourDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("MongoDB connected..."));

app.use("/items", itemRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
