require('dotenv').config()
const express = require('express')
const bodyparser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')

const app = express()

app.use(bodyparser.urlencoded({
    extended: true
}))

app.set('view engine', 'ejs')
app.use(express.static('public'))

mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const userSchema = new mongoose.Schema({
    user_email: {
        type: String,
        required: true
    },
    user_password: {
        type: String,
        required: true
    }
    // user_data:userdataSchema

})


userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields:["user_password"]});

const User = new mongoose.model('User', userSchema)

// const userdataSchema = new mongoose.Schema({
//     name:{type:String}
// })

// const UserData = new.mongoose.model('UserData' , userdataSchema)



app.route("/")

    .get((req, res) => {
        res.render("home")
    });


app.route("/login")

    .get((req, res) => {
        res.render("login", {
            pwexist: ""
        })
    })

    .post((req, res) => {
        const username = req.body.username
        const password = req.body.password
        User.findOne({
            user_email: username
        }, (err, founduser) => {
            if (err) {
                console.log(err)
            } else {
                
                if (founduser) {
                    console.log(founduser.user_password)
                    if (founduser.user_password === password) {
                        res.render("secrets")
                    } else {

                        res.render("login", {
                            pwexist: 'invalid password'
                        })
                        

                    }
                }
            }
        })
    })


app.route("/register")

    .get((req, res) => {
        res.render("register", {
            exist: ""
        })
    })

    .post((req, res) => {

        User.findOne({
            user_email: req.body.username
        }, (err, user) => {
            if (!err) {
                console.log(user)
                if (user) {
                    res.render("register", {
                        exist: "User Exist"
                    })
                    res.redirect("/login")


                } else {
                    const Register = new User({
                        user_email: req.body.username,
                        user_password: req.body.password
                    })
                    Register.save((err) => {
                        if (err) {
                            console.log(err)
                        } else(res.render('secrets'))

                    });


                }
            }
        })


    })







app.listen(3000, (err) => {
    if (!err) {
        console.log('servern has started on port 3000')
    }
})