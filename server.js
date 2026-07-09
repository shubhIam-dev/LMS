const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes")
app.use(express.json());
app.use((req,res,next)=>{
    console.log('loading')
    next()
})
app.use('/course',courseRoutes)
app.use("/user", userRoutes);
app.get("/", (req, res) => {
    res.send("backend is working");
});

mongoose.connect(
    "mongodb+srv://VaniBansal17:helloall@cluster0.ethehwl.mongodb.net/"
)
.then(() => {
    console.log("db connected");
})
.catch((err) => {
    console.log("error in connection");
    console.log(err);
});

app.listen(9000, () => {
    console.log("Server running on port 9000");
});