let express = require('express');
let app = express();

app.get('/', (req, res) =>{
 res.send('backend is working')
})


app.listen(9000)