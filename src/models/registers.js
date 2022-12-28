require('dotenv').config() ;
const mongoose = require('mongoose') ; 
const bcrypt = require('bcrypt') ; 
const jwt = require('jsonwebtoken') ; 

const EmployeeSchema = new mongoose.Schema({
email:{
    type:String , unique:true , required:true
},
name:{
    type:String , required:true
},
password:{
type:String ,
required:true 
},
gender:{
    type:String,required:true
},
tokens:[{
        token:{type:String , required:true}
}]
});

//  generating Tokens : This is a MiddleWare
// this._id : Gives the id of the Registerd User
EmployeeSchema.methods.generateAuthToken = async function(){
    try {
        const user_token = await jwt.sign({id_: this.toString()} ,process.env.SECRET_KEY);

        if(this.tokens.token == null){
        this.tokens = this.tokens.concat({token:user_token}) ;//Adding Unique Token for every User in DB
        await this.save() ; // Store the Token in the DB
    }
    
        return user_token ; 
    } 
     catch (error) {
        // res.send('The error part  = ' + error) ; 
        console.log('The error part = ' + error) ; 
    } 
    }
    

// -----------THIS IS A MIDDLEWARE : EXECUTED B/W TWO OPERATIONS----------------
//This is Password Hashing , the 'pre' method accepts 2 arguments , i.e. event and function(dont use fat arrow function here). This means that this particular function shd execute before the event "save" , which is actually called to save the data on the DB in app.js file .
// We wasnt this function to execute only when there are any changes made to the 'password' field only , so we use .isModified
//the next() is used so that the further code executes after this.

EmployeeSchema.pre("save" , async function(next){

    if(this.isModified('password'))
    { 
    console.log('\n Password Hashing is Running ') ; 
    // console.log(`The original pass = ${this.password}`) ;
this.password = await bcrypt.hash(this.password , 10) ; //(user_input , no._of_rounds)
// console.log(`The Hashed pass = ${this.password}`) ;

}
next() ; 
});



//Creating a Collection
const Register = new mongoose.model("Register" , EmployeeSchema);


module.exports =  Register ; 