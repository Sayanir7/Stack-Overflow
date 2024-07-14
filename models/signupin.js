const mongoose=require('mongoose');



// Define User schema and model
const userSchema = new mongoose.Schema({
    username:{
        type: String, 
        required: true
    },
    password:{
        type: String,
        required: true
    }
    
}, { timestamps:true });

const User = mongoose.model('User', userSchema);

module.exports=User;
