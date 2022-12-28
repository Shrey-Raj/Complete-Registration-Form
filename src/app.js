// require('dotenv').  
require('dotenv').config() ;   
const  express = require('express') ; 
const path = require('path') ; 
const app = express() ; 
const hbs = require('hbs') ; 
const bcrypt = require('bcrypt') ; 
const jwt = require('jsonwebtoken') ; 
const cookieParer = require('cookie-parser') ; 
const auth = require('./middleware/auth') ; 


const PORT = process.env.PORT || 8000 ; 

require('./db/conn.js') ;
const Register = require('./models/registers') ; 
const { Http2ServerResponse } = require('http2');
app.use(express.json()) ;
app.use(cookieParer()) ; 
app.use(express.urlencoded({extended:false})) ;

// const SK = process.env.SECRET_KEY ; 
// const NEW_PORT  = process.env.NEW_PORT ; 

// console.log(`SECRET_KEY =  `, SK ) ; 
// console.log(`NEW PORT  =  `, NEW_PORT ) ; 

const static_path = path.join(__dirname , '../public') ;  
const template_path = path.join(__dirname , '../templates/views') ; 
const partials_path = path.join(__dirname , '../templates/partials') ; 

// app.use(express.static('../public')) ;  
app.set('view engine' , 'hbs') ;  
app.set('views' , '../templates/views') ; 
hbs.registerPartials('../templates/partials') ; 

app.get('/' , async(req,res)=>{
    res.render("index"); 
});

app.get('/register' , (req,res)=>{
    res.render('register') ; 
});
app.get('/login' , (req,res)=>{
    res.render('login') ;   
});
app.get('/secret' , auth , (req,res)=>{
    console.log('Thiis is the cookie : ' , `${req.cookies.jwt}`) ;  
    res.render('secret') ;   
});
app.post('/register' , async(req,res)=>{
    try{
// req.body.{value} --> This 'value' here is the name attribute which we have given to the element in HTML

        const password = req.body.password ; 
        const con_password = req.body.confirmPassword ; 
        //const gender = req.body.gender ; 
        const Employee_email = req.body.email ; 

const emailExists=await Register.find({email:`${Employee_email}`}).count() ;  

        if(emailExists > 0 ){
            res.send(`<h1> This Email Already Exists </h1>`) ; 
            return ; 
        }

            if(password === con_password){
                const registerEmployee = new Register({  //'registerEmployee' is an instance of 'Register'
                    email:`${req.body.email}`,
                    name:`${req.body.name}`,
                    password:`${req.body.password}`,   
                    gender:`${req.body.gender}`,     
                });

                // console.log(registerEmployee) ; 

                const token = await registerEmployee.generateAuthToken() ;

                //The res.cookie() function is used to set the cookie name to value.
                // The value parameter may be a string or object converted to JSON
                // Syntax : res.cookie(name,value,[options])

                // res.cookie('jwt' , token , {
                // expires:new Date(Date.now() + 30000),
                // httpOnly:true,            // So that the user cannot edit the cookie
                // secure : true            // Works for 'https' connections
                // }) ;

                res.cookie('jwt',token) ; 

                const registered = await registerEmployee.save() ; 
                
                res.status(201).render("index.hbs") ;  
                // res.send("SuccessFully Registered " ) ;  
            }else{
                res.send(`<h1> PASSWORDS ARE NOT MATCHING </h1>` ) ;
            }
        
    }
    catch(err){
        console.log(err) ; 
        res.status(400).send(err) ;
    }  
}); 

app.post('/login' , async(req,res)=>{
try {
const user_email = req.body.email ; 
const password = req.body.password ; //Enterd by user

// console.log(user_email);
// console.log(password);


const user = await Register.findOne({email:`${user_email}`}) ; 
 
//Checks if the password(plain text) entered by the  user, is equal to the corresponding hashed value stored in the database.
const does_Match = await bcrypt.compare(password,user.password) ;

const token = await  user.generateAuthToken() ;  

// console.log("Login Token = " , new_token , "\n--------Token Ends--------\n") ; 

    // res.cookie('jwt' , new_token  , {
    // expires:new Date(Date.now() + 600000), 
    // httpOnly:true
    // }) ;

    res.cookie('jwt' , token) ; 

    console.log(`This is the Cookie ` , jwt) ; 

if(does_Match === true){
    console.log("Login Successful !!") ; 
    res.status(201).send('<h1>You have Successfully Logged IN !! </h1>') ; 
}
else{
    res.status(201).send('<h1>Incorrect Credentials !!!</h1>') ; 
}

} catch (error) {
    res.status(400).send(error) ; 
}
});


// I want to display only the Name of the Employees, not entire Details
app.get('/allusers' , async(req,res)=>{
    const employeeName = await Register.find() ;
try {
res.status(201).send(employeeName.name) ; 
} catch (error) {
    res.status(400).send(err);
}
}) ; 

//---------------Secure Password using Bcrypt JS and MongoDB
//Changes have been made in register.js file
// Encryption -> Original 'Input' can be encrypted to 'Code' and Vice-Versa
//Hashing -> INPUT gets converted to a Hash Value and Vice-Versa is not Possible


// const securePassword=async(password)=>{ // Bracket ke andar jo hai , that is the password entered by the user
//         const passwordHash = await bcrypt.hash(password , 10 ) ; 
//         console.log(passwordHash) ; 

//         const passwordMatch = await bcrypt.compare(password , passwordHash) ; 
//         console.log(passwordMatch) ; 
//     }
// securePassword('Shrey@1653') ;


//--------JSON WEB TOKEN ----------------------------
// Change have been made above , before saving the data in DataBase and also in register.js file
// It generates tokens for cookies , which when sent to the server , get decoded to tell the browser that it is the same user who has logged in previously, So it doesnt have to ask for log In Again.

//Payload : It should be a value that is Unique for every user
//Secret Key : It shd be minimum 32 chars long 
//expiresIn : (Optional) To limit the validity for the token , as done in Bank Web - Applications

// const jwt = require('jsonwebtoken') ; 

// const createToken = async()=>{

// const token = await jwt.sign({_id:'639434677cb326611df385b6'} , "mynameisvinodbahadurthapayoutuber") ; //(Payload,Secret Key,{expiresIn:"2 minutes"})
// console.log(token)  ; 

// const userVerify = await jwt.verify(token , "mynameisvinodbahadurthapayoutuber") ; //(Token , Secret Key)
// console.log(userVerify)  ; //returns the payload and a unique id if Verification is Successfull

// } ; 
// createToken() ; 

//-----------------Manage Secrets and Configs usig .ENV package in NodeJS and Mongo DB---------------
// This package is used to hide the minute details(yet very imp) , from the outside world. Ex : Hidig the secret Key from others , when this website will get hosted.

// Install npm i dotenv ,  and require it at the top 
//Create a .env file in ur 'src' directory OR if u r creating it somewhere else then , mention the path in braces like , :            
// require('dotenv').config({path:'C:/Complete Web Development/JAVASCRIPT/ExpressJS Thapa/CompleteRegistrationForm/.env'}) ; 

//-------------------ADDING COOKIES -----------------------
// CHANGES HAVE BEEN MADE IN REGISTRATION PART ABOVE
//---------------COOKIE PARSER PACKAGE------------------------------
// npm i cookie-parser , LINE 18

app.listen(PORT , ()=>{console.log(`Server is Running at port ${PORT}...`)}) ;    
 


