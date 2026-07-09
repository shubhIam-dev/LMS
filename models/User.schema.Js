let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim: true
    },
    email:{
        type:String,
        required:true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:Number,
        required:true
    }

})

let user=module.exports = mongoose.model("User", userSchema);
module.exports = user;