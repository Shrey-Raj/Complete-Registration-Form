const mongoose = require('mongoose') ; 


mongoose.set('strictQuery', false); // Pata nhi kyun ye deprecation warning aa rhi thi , isko lagane se hat gyi

mongoose.connect("mongodb://127.0.0.1:27017/RegisterationForm")
.then(()=>{console.log("Connection Successful With DataBase...")})
.catch((err)=>console.log(err)); 
