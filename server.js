let express = require('express');
let app = express()
let mongoose=require('mongoose')
mongoose.connect("mongodb+srv://nayanraj864_db_user:yrugVslo9cEqFcPg@cluster0.oianhz3.mongodb.net/?appName=Cluster0") 
    .then(() => console.log("Connected to MongoDB"))
    .catch(() => console.log("error occured"))
let userRoute = require("./routes/userRoute")
let courseRoutes = require("./routes/courseRoutes")
app.use(express.json())

// app.use((req,res,next)=>{
//     console.log("middle Way")
//     next()
// });
app.use('/Course',courseRoutes)
app.use('/user',userRoute)



    // app.use(express.json()


app.get('/', (req, res) =>{
 res.send('backend is working')
})


app.listen(9000)