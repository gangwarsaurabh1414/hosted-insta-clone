const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
const USER = mongoose.model("USER")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Jwt_secret} = require("../keys");
const requireLogin = require("../middlewares/requireLogin");

// router.get('/', (req,res) => {
//     res.send("Hello world");
// })

// router.get("/createPost", requireLogin , (req, res) => {
//    console.log("hello auth")
// })

router.post('/signUp', (req, res) => {
    // const name = req.body.name;
    // const userName = req.body.userName;
    // const email = req.body.email;
    // const password = req.body.password;
    const { name, userName, email, password } = req.body;
    
    if (!name || !userName || !email || !password) {
       return res.status(422).json({error : "Please Add All the fields"})
    }

    USER.findOne({ $or: [{ email: email } , {userName : userName} ] } ).then((savedUser) => {
        // console.log(savedUser);
        if (savedUser) {
            return res.status(422).json({error : "User Already exist with that email or userName"})
        }

        bcrypt.hash(password, 12).then((hashedPassword) => {
            const user = new USER({
                name,
                email,
                userName,
                password : hashedPassword
            })

            user.save()
                .then(user => {
                    res.json({ message: "Registered Successfully" })
                })
                .catch(err => { console.log(err); }) 
        })


    })
})

router.post("/signIn", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "Please add email and password" })
    }
    USER.findOne({ email: email }).then((savedUser) => {
        if (!savedUser) {
            return res.status(422).json({error : "Invalid Email"})
        }
        bcrypt.compare(password, savedUser.password).
            then((match) => {
                if (match) {
                    // return res.status(200).json({ message: "Signed in Successfully" })
                  
                    const token = jwt.sign({ _id: savedUser.id }, Jwt_secret)
                    
                    const { _id, name, email, userName } = savedUser
                   
                    res.json({ token, user: { _id, name, email, userName } })
                   
                    console.log({ token, user: { _id, name, email, userName } })



                } else {
                    return res.status(422).json({error:"Invalid Password"})
                }
            
            })
        .catch(err=>console.log(err))
    })
    }
)
module.exports = router;