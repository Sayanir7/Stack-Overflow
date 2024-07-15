// const mongoose=require('mongoose');

// // Define Question schema and model
// const questionSchema = new mongoose.Schema({
//     title: String,
//     description: String,
    
// },  { timestamps: true });

// const Question = mongoose.model('Question', questionSchema);
// module.exports=Question;

const mongoose=require('mongoose');

// Define Question schema and model
const questionSchema = new mongoose.Schema({
    title: String,
    description: {
        type: String,
        required: false
    },
    username: String
},{ timestamps: true });

const Question = mongoose.model('Question', questionSchema);
module.exports=Question;
