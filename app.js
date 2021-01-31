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
  secret: process.env.SECRET,
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


  DB.User.register({
    username: req.body.username,
    sections: []
  }, req.body.password, function (err, user) {

    if (err) {

      console.log(err);
      res.redirect("/");

    } else {

      passport.authenticate("local")(req, res, function () {

        const sectionItems = ['Calender', 'Personal', 'Shoping'];
        const uid = user._id

        sectionItems.forEach(item => {
          DB.Section.create({
            title: item
          }, function (err, section) {


            DB.User.findOneAndUpdate({
              _id: uid
            }, {
              $push: {
                sections: [section._id]
              }
            }, {
              new: true
            }, function (err, user) {
              if (err) {                
                console.log(err);
              } else {
                if (item === 'Calender') {

                  const Calender = require("./register/Calender");
                  const cal_id = Calender(user);
                  // res.redirect("/todo?uid="+ user + ",sid=" + cal_id);               
                  

                } else if (item === 'Personal') {
                  const Personal = require("./register/Personal");
                  const per_id = Personal(user);
                  // res.redirect("/todo?uid="+ user + ",sid=" + per_id);

                } else {
                  const Shoping = require("./register/Shoping");
                  const sho_id = Shoping(user);
                  // res.redirect("/todo?uid="+ user + ",sid=" + sho_id);

                }
              }
            });
          });
        });  
        res.redirect("/todo/"+ uid);
        
      });
    }
  });
});

app.get("/todo/:uid", function (req, res) {
  if (req.isAuthenticated()) {    
    DB.User.findOne({_id: req.params.uid},function (err,user) {
      if (err) {
        console.log(err);
      } else { 
        const cal_id = user.sections[0];
        const per_id = user.sections[1];
        const shop_id = user.sections[2];
        DB.Section.findOne({_id: cal_id},function (err,section) {
          
          if (err) {
            console.log(err);
          } else {
            const sectionTitle = section.title;
            console.log(sectionTitle);
            console.log(section.lists.length);
            const list = section.lists;
            list.forEach(listItem => {
              DB.List.findOne({_id: listItem},function (err,list) {                
                console.log(list);
              })
            });
            
          }
        });

      }
    });
    


  } else {
    res.redirect("/");
  }

});
app.get("/todo/:uid/per", function (req, res) {
  if (req.isAuthenticated()) {    
    DB.User.findOne({_id: req.params.uid},function (err,user) {
      if (err) {
        console.log(err);
      } else { 
        const cal_id = user.sections[0];
        const per_id = user.sections[1];
        const shop_id = user.sections[2];
        res.send(per_id);

      }
    });
    


  } else {
    res.redirect("/");
  }

});

app.post('/login',
  passport.authenticate('local'),
  function(req, res) {    
    const uid = req.user._id;
    res.redirect("/todo/"+ uid);
    
  });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port || 3000, function () { //listioning on port 1705
  console.log("server is running on port 1705"); //sending msg of conformation
});