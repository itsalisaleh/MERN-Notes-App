require('dotenv').config();

const config = require('./config.json');
const mongoose = require('mongoose');

const User = require('./models/user.model')
const Note = require('./models/note.model')

mongoose.connect(config.connectionString);
const express = require('express');
const cors = require('cors');

const app = express();

const jwt = require('jsonwebtoken');
const {authenticationToken} = require('./utilities');
app.use(express.json());

app.use(cors({
    origin: "*",
}));

app.get("/",(req,res)=> {
    res.json({data:"hello world"});
})
/*
//create acc
app.post("/create-account", async (req,res)=> {

        const {fulName, email, password} = req.body;

        if(!fulName) {
            return res.status(400).json({error: true,message: "full name is required"});
        }
        if(!email) {
            return res.status(400).json({error: true,message: "email is required"});
        }
        if(!password) {
            return res.status(400).json({error: true,message: "password is required"});
        }
        const isUser = await User.findOne({email});
        console.log(isUser)
        if(isUser) {
            return res.json({
                error: true,
                message: "user is already exist",
            })
        }
        const user = new User({
            fulName,
            email,
            password,
        })
        await user.save();
        const accessToken = jwt.sign({user},process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "3600m",
        });
        return res.json({
            error: false,
            user,
            accessToken,
            message: "registration is done succesfuly",
        })
})
*/

const bcrypt = require('bcrypt'); // Ensure you import bcrypt


app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName) {
        return res.status(400).json({ error: true, message: "Full name is required" });
    }
    if (!email) {
        return res.status(400).json({ error: true, message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ error: true, message: "Password is required" });
    }

    // Check if user already exists
    const isUser = await User.findOne({ email });
    if (isUser) {
        return res.status(409).json({
            error: true,
            message: "User already exists",
        });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
        fullName, // Corrected to fullName
        email,
        password: hashedPassword, // Save hashed password
    });

    await user.save();

    // Generate JWT token
    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h", // Changed to 1 hour
    });

    return res.status(201).json({
        error: false,
        user,
        accessToken,
        message: "Registration successful",
    });
});

//login
app.post('/login',async (req,res) => {
    const {email, password} = req.body;

    if(!email) {
        return res.status(400).json({message: "email is required"});
    }
    if(!password) {
        return res.status(400).json({message: "password is required"});
    }
    const userInfo = await User.findOne({email: email});
    if(!userInfo) {
        return res.status(400).json({message : "worng email address"});
    }
    if(userInfo.password == password) {
       const user = {user: userInfo};
       const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "36000m",
       });
       return res.json({
            error: false,
            message: "Login success",
            email,
            accessToken,
       });
    }else {
        return res.status(400).json({
            error: true,
            message: "Invalid Credentials"
        })
    }

})

//get-user
app.get('/get-user',authenticationToken,async (req,res) => {
    const { user } = req.user;
    const isUser = await User.findOne({_id: user._id});

    if(!isUser) {
        return res.sendStatus(401);
    }

    return res.json({
        user: {fulName: isUser.fulName , email: isUser.email, "_id": isUser._id, createdOn: isUser.createdOn},
        message: ""
    })
})

//add note
app.post("/add-note",authenticationToken,async (req,res)=> {
    const {title, content, tags} = req.body;
    const {user} = req.user;
    if(!title) {
        return res.status(400).json({error: true,message: "title is required"});
    }
    if(!content) {
        return res.status(400).json({error: true,message: "content is required"});
    }

    try {
        const note = new Note( {
            title,
            content,
            tags: tags || [],
            userId: user._id,
        });
        await note.save();
        return res.json({
            error: false,
            note,
            message: "note added success",
        })
    }catch (error) {
        res.status(500).json({erro: error});
    }
    
})

//edit note
app.put("/edit-note/:noteId",authenticationToken, async (req,res)=> {
    const noteId = req.params.noteId;
    const {title, content, tags, isPinned} = req.body;
    const {user} = req.user;

    if(!title && !content && !tags) {
        return res.status(400).json({
            error: true,
            message: "No change provided" 
        })
    }
    try {
        const note = await Note.findOne({_id: noteId, userId: user._id});
        if(!note) {
            return res.status(404).json({
                erro: true,
                message: "Note not found"
            })
        }
        if(title) note.title = title;
        if(content) note.content = content;
        if(tags) note.tags = tags;
        if(isPinned) note.isPinned = isPinned;
        await note.save();
        return res.json({
            error: false,
            note,
            message: "change is updated"
        })
    }catch(error) {
        return res.status(500).json({
            error: true,
            message: "inernal server Error",
            theerr : error
        })
    }

})

//get all
app.get("/get-all/",authenticationToken, async (req,res)=> {
    const { user } = req.user;
    try {
        const notes = await Note.find({userId: user._id}).sort({
            isPinned: -1
        })
        return res.status(200).json({
            error: false,
            notes,
            message: "all notes retrieved successfully"
        })
     }catch(err) {
        res.status1(500).json({
            error: true,
            err,
            message: "internal server error"
        })
     }
    
})

//delete Note
app.delete("/delete-note/:noteId",authenticationToken,async(req,res)=>{
    const noteId = req.params.noteId;
    const { user } = req.user;

    try {
        const note = await Note.findOne({_id : noteId, userId : user._id });
        if(!note) {
           return res.status(404).json({
                error: true,
                message: "note dosent exist"
            })
        }
        await note.deleteOne();
        return res.status(200).json({
            error: false,
            message: "note deleted successfully"
        })



    }catch(err) {
        res.status(500).json({
            error: true,
            err,
            message: "inernal server error"
        })
    }
})

//updatae isPinned
app.put('/update-pinned/:noteId',authenticationToken,async (req,res) => {
    const noteId = req.params.noteId;
    const {isPinned} = req.body;
    const {user} = req.user;

   
    try {
        const note = await Note.findOne({_id: noteId, userId: user._id});
        if(!note) {
            return res.status(404).json({
                erro: true,
                message: "Note not found"
            })
        }
        
        note.isPinned = isPinned;
        await note.save();
        return res.json({
            error: false,
            note,
            message: "change is updated"
        })
    }catch(error) {
        return res.status(500).json({
            error: true,
            message: "inernal server Error",
            theerr : error
        })
    }
})

app.listen(8000,()=> {
    console.log('server is running');
})

module.exports = app;