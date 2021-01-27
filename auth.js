const express = require('express'); // requiring express
const bodyParser = require('body-parser'); // requiring body parser
const mongoose = require('mongoose'); //requiring mongoose for db
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const { Passport } = require('passport');


const app = express(); // initialize express to app
app.use(bodyParser.urlencoded({ //syntext to use body parser
  extended: true
}));
app.use(express.static("public")); // sending public files to user
app.set('view engine', 'ejs'); // setting up ejs module

app.use(session({
  secret: process.env.SECRET,
  resave:false,
  saveUninitialized:true
}));
app.use(passport.initialize());
app.use(passport.session());
// mongoose.connect(process.env.MDB_CONNECT+"/tododb", {// createing tododb data base & running mongodb server on local host
//   useUnifiedTopology: true,// removing depication WARNING
//   useFindAndModify: false,// removing depication WARNING
//   useNewUrlParser: true// removing depication WARNING
// });

mongoose.connect("mongodb://localhost:27017/tododb", {// createing tododb data base & running mongodb server on local host
  useUnifiedTopology: true,// removing depication WARNING
  useFindAndModify: false,// removing depication WARNING
  useNewUrlParser: true,// removing depication WARNING
  useCreateIndex: true
});

const UserSchema = new mongoose.Schema({
  email: String,
  password: String
});
UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("user",UserSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/auth",function (req,res) {
    res.render("auth");
  });
app.post("/register",function (req,res) {
    console.log(req.body.email);
    User.register({email: req.body.email}, req.body.password, function (err,user) {
       if(err){
           console.log(err);
           res.redirect("auth");
       } else{
           passport.authenticate((req,res) , function()  {
               res.render("list");
           })
       }
    });
});