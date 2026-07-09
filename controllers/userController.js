const User = require("../models/User.schema")

 const addUser = async (req,res) => {
    try {

        const { name, email, phoneNumber, password} = req.body;

        // Validate required fields
    if (!name || !email || !phoneNumber || !password) {
      return res.send({ message: 'All fields are required' });
    }

    // Check if user already exists
    // const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    // if (existingUser) {
    //   return res.send({ message: 'Email or phone number already registered' });
    // }


    // Create new user
    const newUser = new User({
      name,
      email,
      phoneNumber,
      password,  
    });

    await newUser.save();
    res.status(201).send({ message: 'User added successfully', user: newUser })
    }catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
    }

};


const getUser = async (req, res) => {
  try {
    let users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }

};




module.exports = {addUser,getUser};