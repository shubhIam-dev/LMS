let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:String,
    password:String,
    phoneNumber:Number,
})

module.exports = mongoose.model("User", userSchema);