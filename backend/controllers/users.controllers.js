const User=require("../models/User.model")

function addUser(req,res){
    const {name,email,password,phoneNumber} = req.body

    if (!name || !email || !password || !phoneNumber ){
        return res.send({ message: 'All fields are required' })
    }
    let newUser=new User({
        name,
        email,
        password,
        phoneNumber
    })
    

    newUser.save()
    res.json({
      message: 'User registered successfully',
      name: newUser.name,
      email: newUser.email,
      password:newUser.password,
      phoneNumber:newUser.phoneNumber
    });
}
function getUser(req,res){
    // User.findOne({phoneNumber:req.body.phoneNumber}).then((a)=>{
    //       if (!a){
    //         res.send("USer not found ")
    //     }else{
    //         res.json(a)
    //     }
    // })
     User.findOne({phoneNumber:req.query.phoneNumber}).then((a)=>{
          if (!a){
            res.send("User not found ")
        }else{
            res.json(a)
        }
    })

}
function addUsers(req,res){
     User.insertMany(req.body)
    res.json({
      message: 'Users registered successfully',
   
    });
}

module.exports={addUser,getUser,addUsers}