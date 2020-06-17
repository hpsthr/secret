require('dotenv').config()
const express = require('express')
const bodyparser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require("passport")
const passportLocalMongoose = require('passport-local-mongoose')
const app = express()

app.use(bodyparser.urlencoded({
    extended: true
}))

app.set('view engine', 'ejs')
app.use(express.static('public'))


app.use(session({
    secret: "CiAsecurity",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String
    }
})

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model('User', userSchema)

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route("/")

    .get((req, res) => {
        res.render("home")
    });

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets")

    } else {
        res.redirect("/login")
    }
})

app.route("/login")

    .get((req, res) => {
        res.render("login", {
            uexist: 'Email',
            pwexist: "password"
        })
    })

    .post((req, res) => {
        const username = req.body.username
        const password = req.body.password

        const user = new User({
            username: username,
            password: password
        })
        req.login(user, (err) => {
            if (err) {
                console.log(err)
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.render("secrets")
                })
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
        User.register({
            username: req.body.username
        }, req.body.password, (err, founduser) => {
            if (err) {
                console.log(err)
                res.redirect("/register")
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.render("secrets")
                })
            }
        })
    })

app.get("/logout",  (req, res) => {
    req.logout(),
    res.redirect("/")
})

app.listen(3000, (err) => {
    if (!err) {
        console.log('servern has started on port 3000')
    }
})