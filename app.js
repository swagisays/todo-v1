require('dotenv').config();
const express = require('express');
var cookieParser = require('cookie-parser'); // requiring express
const bodyParser = require('body-parser'); // requiring body parser
const mongoose = require('mongoose'); //requiring mongoose for db
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook');
// auth modules
const session = require('express-session');



const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");

const app = express(); // initialize express to app
app.use(bodyParser.urlencoded({ //syntext to use body parser
  extended: true
}));

app.use(cookieParser());
// app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 36000000,
    httpOnly: false // <- set httpOnly to false
  }
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

app.use(express.static(__dirname + '/public'));
app.use('/todo/calender', express.static(__dirname + '/public'));
app.use('/todo/personal', express.static(__dirname + '/public'));
app.use('/todo/shoping', express.static(__dirname + '/public'));


// sending public files to user
app.set('view engine', 'ejs'); // setting up ejs module


const DB = require("./models/index");
const {
  init
} = require('./models/list');
const Calender = require('./register/Calender');


passport.use(DB.User.createStrategy());

passport.serializeUser(function (user, done) {

  done(null, user.id);

});

passport.deserializeUser(function (id, done) {

  DB.User.findById(id, function (err, user) {
    done(err, user);
  });

});


passport.use(new FacebookStrategy({
  clientID: process.env.FB_APPID,
  clientSecret: process.env.FB_SECRET,
  callbackURL: "http://localhost:1705/auth/facebook/todo"
},
function(accessToken, refreshToken, profile, cb) {

     console.log(profile);
      
    DB.User.findOne({ facebookId: profile.id }, function (err, user) {

      if (err) {

        console.log(err);
        
      } else {

        if (!user) {

          const user = new DB.User({
            facebookId: profile.id
          });
          user.save();

          const sectionItems = ['calender', 'personal', 'shoping'];
          console.log(user._id);     
  
          sectionItems.forEach(item => {
            DB.Section.create({
              title: item
            }, function (err, section) {
              DB.User.findOneAndUpdate({
                _id: user._id
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
  
                  if (item === 'calender') {
  
                    const Calender = require("./register/Calender");
                    Calender(user);
  
                  } else if (item === 'personal') {
                    const Personal = require("./register/Personal");
                    Personal(user);
  
                  } else if (item === 'shoping') {
                    const Shoping = require("./register/Shoping");
                    Shoping(user);
  
                  }
  
                }
              });
            });
          });
  
          return cb(err, user);
        } else {

          console.log(user);
          return cb(err, user);
          
        }
        
      }
      
      
    });
  }

));




passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "http://localhost:1705/auth/google/todo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
      
    DB.User.findOne({ googleId: profile.id }, function (err, user) {

      if (err) {

        console.log(err);
        
      } else {

        if (!user) {

          const user = new DB.User({
            googleId: profile.id
          });
          user.save();

          const sectionItems = ['calender', 'personal', 'shoping'];
          console.log(user._id);     
  
          sectionItems.forEach(item => {
            DB.Section.create({
              title: item
            }, function (err, section) {
              DB.User.findOneAndUpdate({
                _id: user._id
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
  
                  if (item === 'calender') {
  
                    const Calender = require("./register/Calender");
                    Calender(user);
  
                  } else if (item === 'personal') {
                    const Personal = require("./register/Personal");
                    Personal(user);
  
                  } else if (item === 'shoping') {
                    const Shoping = require("./register/Shoping");
                    Shoping(user);
  
                  }
  
                }
              });
            });
          });
  
          return cb(err, user);
        } else {

          console.log(user);
          return cb(err, user);
          
        }
        
      }
      
      
    });
  }
));



app.get("/", function (req, res) {  

  res.render("index");

});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/todo', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/todo');
  });

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/todo',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/todo');
  });


app.get("/login", function (req, res) {

  res.render("login");

});
app.get("/logout", function (req, res) {

  req.logout();
  res.redirect("/");

});
const ids = {
  u_id: null,
  cal_id: null,
  per_id: null,
  shop_id: null
}
const sectionArray = ['calender', 'personal', 'shoping'];



app.post("/register", function (req, res) {

  req.session.calList = [];
    req.session.perList = [];
    req.session.shopList = [];  
   


  DB.User.register({
    username: req.body.username,
    sections: []
  }, req.body.password, function (err, user) {

    if (err) {

      console.log(err);
      res.redirect("/");

    } else {

      passport.authenticate("local")(req, res, function () {

        const sectionItems = ['calender', 'personal', 'shoping'];
        console.log(user._id);

        console.log(req.session.passport.user);



        sectionItems.forEach(item => {
          DB.Section.create({
            title: item
          }, function (err, section) {
            DB.User.findOneAndUpdate({
              _id: req.session.passport.user
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

                if (item === 'calender') {

                  const Calender = require("./register/Calender");
                  Calender(user);

                } else if (item === 'personal') {
                  const Personal = require("./register/Personal");
                  Personal(user);

                } else if (item === 'shoping') {
                  const Shoping = require("./register/Shoping");
                  Shoping(user);

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
var calList;
var perList;
var shopList;

app.get("/todo", function (req,res) {
  req.session.calList = [];
    req.session.perList = [];
    req.session.shopList = [];
  
  

  if (req.isAuthenticated()) { 

      

    DB.User.findOne({_id: req.session.passport.user}, function (err,user) {

      if (err) {
        console.log(err);
        
      } else {        

        user.sections.forEach(secId => { 

          DB.Section.findOne({_id: secId}, function (err,section) { 

            if (err) {
              console.log(err);
              
            } else {

              if (section.title === 'calender') {
                section.lists.forEach(listId => {  
                DB.List.findOne({_id: listId}, function (err,list) { 
  
                  if (err) {
                    console.log(err);
                    
                  } else {
                    calList = [];
                    req.session.calList.push(list.title);
                    calList = req.session.calList;
                    
                    
                  }
                  
                });
                
              });
                
              } else if(section.title === 'personal'){

                section.lists.forEach(listId => {               

                  DB.List.findOne({_id: listId}, function (err,list) { 
    
                    if (err) {
                      console.log(err);
                      
                    } else {  
                      perList = [];
                      req.session.perList.push(list.title);
                      perList = req.session.perList;
                    }
                    
                  });
                  
                });

              } else if(section.title === 'shoping'){

                section.lists.forEach(listId => {               

                  DB.List.findOne({_id: listId}, function (err,list) { 
    
                    if (err) {
                      console.log(err);
                      
                    } else {  
                      shopList = [];
                      req.session.shopList.push(list.title);
                      shopList = req.session.shopList;
                      
                      
                    }
                    
                  });
                });
              }   
              
            } 
          });         
        });  
         res.redirect("/todo/calender/today");      
      }      
    });
    
  } else {

    res.redirect("/");
    
  }


  
});



app.get("/todo/:sec/:listName", function (req, res) {
  if (req.isAuthenticated()) {
    

    DB.User.findOne({
      _id: req.session.passport.user
    }, function (err, user) {

      if (err) {
        console.log(err);

      } else { 
        console.log(calList);
        console.log(perList);
        console.log(shopList);

        var sec = req.params.sec;
        var listName = req.params.listName;        
        var cal_id = user.sections[0];
        var per_id = user.sections[1];
        var shop_id = user.sections[2];

        if (sec === 'calender') {
          
          var secId = cal_id;
          
          var listIndex = calList.indexOf(listName);

        } else if (sec === 'personal') { perList = [];

          var secId = per_id;
          
          var listIndex = perList.indexOf(listName);

        } else if (sec === 'shoping') { shopList = [];

          var secId = shop_id;
          
          var listIndex = shopList.indexOf(listName);
          

        }

        DB.Section.findOne({
          _id: secId
        }, function (err, section) {
          if (err) {
            console.log(err);
          } else { 
          
            
            const listId = section.lists[listIndex];
            

            DB.List.findOne({
              _id: listId
            }, function (err, list) {

              if (err) {
                console.log(err);
              } else {
                
                var listItems = list.items;

                res.render("home", {
                  sections: sectionArray,
                  calList: calList,
                  perList: perList,
                  shopList: shopList,
                  sec: sec,
                  listName: listName,
                  listItems: listItems
                });
                


              }
            });
          }
        });
      }

    });
  } else {
    res.redirect("/");
  }

});

app.post("/todo/:sec", function (req, res) {

  if (req.isAuthenticated()) {

    DB.User.findOne({
      _id: req.session.passport.user
    }, function (err, user) {

      if (err) {
        console.log(err);

      } else {

        var sec = req.params.sec;
        var cal_id = user.sections[0];
        var per_id = user.sections[1];
        var shop_id = user.sections[2];


        if (sec === 'calender') {

          DB.List.create({
            title: req.body.listTitle
          }, function (err, list) {

            DB.Section.findOneAndUpdate({
              _id: cal_id
            }, {
              $push: {
                lists: [list._id]
              }
            }, {
              new: true
            }, function (err, list) {
              if (err) {
                console.log(err);
              } else {
                calList.push(req.body.listTitle);
                res.redirect("/todo/calender/today");
              }
            });

          });

        } else if (sec === 'personal') {

          DB.List.create({
            title: req.body.listTitle
          }, function (err, list) {

            DB.Section.findOneAndUpdate({
              _id: per_id
            }, {
              $push: {
                lists: [list._id]
              }
            }, {
              new: true
            }, function (err, list) {
              if (err) {
                console.log(err);
              } else {
                perList.push(req.body.listTitle);
                res.redirect("/todo/personal/home");
              }
            });

          });


        } else if (sec === 'shoping') {

          DB.List.create({
            title: req.body.listTitle
          }, function (err, list) {

            DB.Section.findOneAndUpdate({
              _id: shop_id
            }, {
              $push: {
                lists: [list._id]
              }
            }, {
              new: true
            }, function (err, list) {
              if (err) {
                console.log(err);
              } else {

                shopList.push(req.body.listTitle);
                res.redirect("/todo/shoping/grocery");
              }
            });

          });
        }
      }
    });

  } else {
    res.redirect("/");
  }
});

app.post('/todo/:sec/:listName', function (req, res) {
  if (req.isAuthenticated()) {

    DB.User.findOne({
      _id: req.session.passport.user
    }, function (err, user) {

      if (err) {
        console.log(err);

      } else {
        var sec = req.params.sec;
        var listName = req.params.listName;
        var cal_id = user.sections[0];
        var per_id = user.sections[1];
        var shop_id = user.sections[2];



        if (sec === 'calender') {
          var secId = cal_id;
          var listIndex = calList.indexOf(listName);

        } else if (sec === 'personal') {

          var secId = per_id;
          var listIndex = perList.indexOf(listName);

        } else if (sec === 'shoping') {

          var secId = shop_id;
          var listIndex = shopList.indexOf(listName);

        }

        DB.Section.findOne({
          _id: secId
        }, function (err, section) {

          if (err) {

            console.log(err);

          } else {
            const listId = section.lists[listIndex];

            DB.List.findOne({
              _id: listId
            }, function (err, list) {

              if (err) {

                console.log(err);

              } else {

                const newItem = new DB.Item.ItemModel({
                  value: req.body.value
                });

                list.items.push(newItem);
                list.save();
                res.redirect("/todo/" + sec + "/" + listName);
              }
            });
          }
        });
      }
    });
  } else {
    res.redirect("/");

  }

});

app.post('/login',
  passport.authenticate('local'),
  function (req, res) {   
   
    // ids.u_id = req.user._id;
    // ids.cal_id = req.user.sections[0];
    // ids.per_id = req.user.sections[1];
    // ids.shop_id = req.user.sections[2];
    res.redirect("/todo");

  });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 1705;
}

app.listen(port || 1705, function () { //listioning on port 1705
  console.log("server is running on port 1705"); //sending msg of conformation
});