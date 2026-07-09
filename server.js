let express = require('express');
let app = express();
let mongoose=require("mongoose")
let userRoutes = require('./routes/userRoutes')
let courseRoutes=require('./routes/courseRoutes.js')
let assignmentsRoutes=require('./routes/assignmentsRoutes.js')
mongoose.connect("mongodb+srv://adityaghate66_db_user:hIS0YnU1Dg2ixx0E@cluster0.dagflbh.mongodb.net/?appName=Cluster0")
.then(()=>
    console.log("Connected TO DataBase")
).catch(()=>console.log("Error While Connection"))
app.use(express.json())
app.use('/course',courseRoutes)
app.use('/user', userRoutes)
app.use('/assignments',assignmentsRoutes)


app.get('/', (req, res) =>{
 res.send('backend is working')
})


app.listen(9000)