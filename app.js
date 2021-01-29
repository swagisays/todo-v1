require('dotenv').config();
const express = require('express'); // requiring express
const bodyParser = require('body-parser'); // requiring body parser
const mongoose = require('mongoose'); //requiring mongoose for db
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
// auth modules
const session = require('express-session');
const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");

const app = express(); // initialize express to app
app.use(bodyParser.urlencoded({ //syntext to use body parser
  extended: true
}));
app.use(express.static("public")); // sending public files to user
app.set('view engine', 'ejs'); // setting up ejs module

// app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// mongoose.connect(process.env.MDB_CONNECT+"/tododb", {// createing tododb data base & running mongodb server on local host
//   useUnifiedTopology: true,// removing depication WARNING
//   useFindAndModify: false,// removing depication WARNING
//   useNewUrlParser: true// removing depication WARNING
// });

mongoose.connect("mongodb://localhost:27017/tododb", { // createing tododb data base & running mongodb server on local host
  useUnifiedTopology: true, // removing depication WARNING
  useFindAndModify: false, // removing depication WARNING
  useNewUrlParser: true // removing depication WARNING
});


const DB = require("./models/index");

passport.use(DB.User.createStrategy());

passport.serializeUser(function (user, done) {

  done(null, user.id);

});

passport.deserializeUser(function (id, done) {

  DB.User.findById(id, function (err, user) {
    done(err, user);
  });

});


app.get("/", function (req, res) {

  res.render("register");

});
app.get("/login", function (req, res) {

  res.render("login");

});
app.get("/logout", function (req, res) {

  req.logout();
  res.redirect("/");

});

app.post("/register", function (req, res) {  
  

  DB.User.register({username: req.body.username, sections: []}, req.body.password, function (err, user) {

    if (err) {

      console.log(err);
      res.redirect("/");

    } else {

      passport.authenticate("local")(req, res, function () {    

        const sectionItems = ['Calender','Personal','Shoping']

        sectionItems.forEach(item => {
          DB.Section.create({title: item}, function (err,section) {        
            
           DB.User.findOneAndUpdate({_id: user._id}, {$push: {sections: [section._id]}} ,{new: true}, function (err,user) {
             if (err) {
               console.log(err);
             } else {               
               if (item === 'Calender') {
                 const sectionId = user.sections[0];
                 console.log(sectionId);

                 const listItems = ['Today','Tomorrow','Some Day'];

                 listItems.forEach(item => {

                  DB.List.create({title: item}, function (err,list) {

                    DB.Section.findOneAndUpdate({_id: sectionId}, {$push: {lists: [list._id]}}, {new: true}, function (err,list) {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log(user);
                        console.log(list);
                      }
                    })
                    
                  });

                 });
               }else if(item === 'Personal'){

                const sectionId = user.sections[1];
                 console.log(sectionId);

                 const listItems = ['Home','Work'];

                 listItems.forEach(item => {

                  DB.List.create({title: item}, function (err,list) {

                    DB.Section.findOneAndUpdate({_id: sectionId}, {$push: {lists: [list._id]}}, {new: true}, function (err,list) {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log(user);
                        console.log(list);
                      }
                    })
                    
                  });

                 });

               }else{
                const sectionId = user.sections[2];
                console.log(sectionId);

                const listItems = ['Grocery'];

                listItems.forEach(item => {

                 DB.List.create({title: item}, function (err,list) {

                   DB.Section.findOneAndUpdate({_id: sectionId}, {$push: {lists: [list._id]}}, {new: true}, function (err,list) {
                     if (err) {
                       console.log(err);
                     } else {
                       console.log(user);
                       console.log(list);
                     }
                   })
                   
                 });

                });
               }
             }
           });           
          });
          
        }); 

       
        res.redirect("/todo");
      });

    }
  });

});
app.post("/login", function (req, res) {

  const user = new DB.User({
    username: req.body.email,
    password: req.body.password
  });
  

  req.login(user, function (err) {

    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/todo");
      });
    }

  });

});



app.get("/todo",function (req,res) {
  if (req.isAuthenticated()) {
   res.send("hi");
    

  } else {
    res.redirect("/");
  }

});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 1705;
}

app.listen(port || 1705, function () { //listioning on port 1705
  console.log("server is running on port 1705"); //sending msg of conformation
});