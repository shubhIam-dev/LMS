const Users = require("../models/users.model");
const addUser = async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const user = await Users.create({
            name,
            email,
            password,
            phoneNumber
        });

        res.status(201).json(user);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: ("Server error")
        });
    }
};
const addManyUsers = async (req,res)=>{
   try{
    const manyUsers = await Users.insertMany(req.body)
    res.status(201).json(manyUsers)
   }
   catch(err){
    console.log(err)
    res.status(500).json({
      message: ("Server error")
    });
   }
}
const getUser = async (req, res) => {
    try{const users = await Users.findOne(
            {phoneNumber: req.params.phone
 } )}
    catch(error){res.json(users);
    console.log(req.query.phoneNumber)}
};

module.exports = {
    addUser,
    getUser,
    addManyUsers
};
