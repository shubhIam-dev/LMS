let express = require('express');
let app = express();
let userRoutes = require('./routes/userRoutes')
let courseRoutes = require('./routes/courseRoutes')

mongoose.connect(url)
.then()


app.use('/users', userRoutes)
app.use('/courses', courseRoutes)



app.get('/', (req, res) =>{
 res.send('backend is working')
})


app.listen(9000)