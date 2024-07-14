const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const User=require('./models/signupin');
const Question=require('./models/question');
const Answer=require('./models/answer');
const cookieParser=require('cookie-parser');




const app = express();
const PORT = 3000;
const SECRET_KEY = '19125114'; // Use a more secure key in production

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB Atlas
const mgUrl='mongodb+srv://sayanroy2802:19125114s@nodetuts.skuzx7m.mongodb.net/stack-overflow?retryWrites=true&w=majority&appName=nodetuts'
mongoose.connect(mgUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
}).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
    
    
    console.log('Connected to MongoDB Atlas');
}).catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
});



// Middleware to protect routes
const authenticateJWT = (req, res, next) => {
    const token =req.cookies.jwt;

    if (token) {
        jwt.verify(token, SECRET_KEY, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                // res.redirect('/login');
                return res.sendStatus(403);
                
            }
            // console.log(decodedToken);
            next();
        });
    } else {
        res.sendStatus(401);
    }
};





// Register route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.status(400).render('signup', { message: 'User already exists' });
    }
    const user = new User({ username, password });
    await user.save();
    res.status(201).render('login', { message: 'User registered successfully. Please login.' });
});

// Login route


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        const accessToken = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        
        res.cookie('jwt',accessToken,{httpOnly:true,maxAge:1000*60*60});
        res.cookie('username',user.username,{httpOnly:true,maxAge:1000*60*60});

        res.redirect('/home');

        // res.render('home', { message: 'Login successful', user: user.username,  });
        // res.render('question', {  token: accessToken });

    } else {
        res.status(401).render('login', { message: 'Invalid credentials' });
    }
});

// Serve the signup and login pages
app.get('/signup', (req, res) => {
    res.render('signup', { message: null });
});

app.get('/login', (req, res) => {
    res.render('login', { message: null });
});




// post and answer questions..................
// ...........................................

// Serve the question form

app.get('/question', authenticateJWT, (req, res) => {
    
    res.render('question', { message: null, });
});

// Handle question submission
app.post('/question', authenticateJWT, async (req, res) => {
    
    // const question= new Question(req.body);

    // question.save()
    //     .then ((result)=>{
        
    //     res.redirect('/questions');

    //     })
    //     .catch((err)=>{
    //         console.log(err);
    //     });
    
    const { title, description } = req.body;
    const question = new Question({
        title,
        description,
        username: req.cookies.username
    });
    await question.save();
    res.redirect('/home');
});




// List all questions
app.get('/questions', async (req, res) => {
    const questions = await Question.find().sort({ createdAt: -1 });
    // const user=await User.find();
    res.render('questions', { questions });
});
app.get('/home',authenticateJWT, async(req,res)=>{
    const questions = await Question.find().sort({ createdAt: -1 });
    // const user=await User.find();
    res.render('home', { questions });

})

// app.get('/my-question',authenticateJWT, async (req, res) => {
    
//     const username = req.cookies.username;
//     // console.log(username);
//     const questions = await Question.find({ username: username }).sort({createdAt:-1});
//     // console.log();
//     questions.forEach(q =>{
//         console.log(q._id);
//         const answers=Answer.find({questionId: q._id});
//         console.log(answers);
//     })

   
//     // const answers= await Answer.find({questionId: questions._id})
//     if (questions.length > 0) {
//         res.render('my-questions', { questions});
//     } else {
//         res.status(404).send('No questions found for this user');
//     }
//     // const findUsername=req.cookies.username;
//     // const questions = await Question.findby({findUsername}).sort({ createdAt: -1 });
//     // // const user=await User.find();
//     // res.render('my-questions', { questions });
// });

app.get('/my-question', authenticateJWT, async (req, res) => {
   
    try {
        const username=req.cookies.username;



        const my_answers=await Answer.find({username:username}).sort({createdAt:-1});

        const answerWithQuestion=await Promise.all(
            my_answers.map(async (ans)=>{
                const ques=await Question.findById(ans.questionId);
                return {ans, ques};
            })
        );






        
        const questions = await Question.find({ username: username }).sort({createdAt:-1});
        // const questions = await Question.find().sort({ createdAt: -1 });
        const questionsWithAnswers = await Promise.all(
            questions.map(async (question) => {
                const answers = await Answer.find({ questionId: question._id }).sort({ createdAt: -1 });
                return { question, answers };
            })
        );

        res.render('my-questions', { questionsWithAnswers ,answerWithQuestion});
    } catch (error) {
        res.status(500).send('Error fetching questions and answers');
    }
});

// View a single question with answers
app.get('/question/:id', async (req, res) => {
    const question = await Question.findById(req.params.id);
    
    const answers = await Answer.find({ questionId: req.params.id }).sort({createdAt:-1});
    res.render('question_detail', { question, answers });
});


// Handle answer submission
app.post('/answer', authenticateJWT, async (req, res) => {
    const { questionId, answer,user } = req.body;
    

    const current_user=req.cookies.username;
    
    if(current_user==user){
        // console.log('this is your question ');
        // alert('This is Your Question ');
        // res.window.alert('jkshdfjo')
        return res.status(400).json({ message: 'You cannot answer your own question' });
    } 
    const newAnswer = new Answer({
        questionId,
        answer,
        username: req.cookies.username
    });
  
        
    await newAnswer.save();
    res.redirect(`/question/${questionId}`);
    
    
    
});


app.get('/logout',  async(req,res)=>{
    res.cookie('jwt',' ',{maxAge:1});
    res.cookie('username',' ',{maxAge:1});
    res.redirect('/login');
})