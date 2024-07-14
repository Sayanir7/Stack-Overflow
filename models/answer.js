const mongoose=require('mongoose');

// Define Answer schema and model
const answerSchema = new mongoose.Schema({
    questionId: mongoose.Schema.Types.ObjectId,
    answer: String,
    username: String
}, { timestamps: true });

const Answer = mongoose.model('Answer', answerSchema);

module.exports=Answer;

