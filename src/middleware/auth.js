const jwt = require('jsonwebtoken') ;
const Register = require('../models/registers') ; 

const auth = async(req,res,next)=>{
    try {
        console.log("Authorization is running ") ; 
        const token = req.cookies.jwt ; 
        const verifyUser = jwt.verify(token , process.env.SECRET_KEY) ; 
        console.log(verifyUser) ; 

        const user = await Register.findOne({_id:verifyUser._id}) ; 
        console.log(user) ; 
        next() ; 
    } catch (error) {
        res.status(401).send(`<h1> Unauthorized !</h1> ${error}`) ; 
    }
}

module.exports = auth ; 