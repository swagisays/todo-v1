require('dotenv').config();
const express = require('express');// requiring express
const bodyParser = require('body-parser'); // requiring body parser
const mongoose = require('mongoose'); //requiring mongoose for db
const passportLocalMongoose = require("passport-local-mongoose");
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook');
const passport = require("passport");

const Schema = mongoose.Schema;

const app = express(); // initialize express to app

app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { expires: new Date(253402300000000) }
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

// sending public files to user
app.use(express.static(__dirname + '/public'));
app.use('/todo/calender', express.static(__dirname + '/public'));
app.use('/todo/personal', express.static(__dirname + '/public'));
app.use('/todo/shoping', express.static(__dirname + '/public'));

app.set('view engine', 'ejs'); // setting up ejs module

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

passport.use(new FacebookStrategy({
    clientID: process.env.FB_APPID,
    clientSecret: process.env.FB_SECRET,
    callbackURL: "http://localhost:1705/auth/facebook/todo"
  },
  function (accessToken, refreshToken, profile, cb) {

    console.log(profile);
    

    DB.User.findOne({facebookId: profile.id}, function (err, user) {

      if (err) {

        console.log(err);

      } else {

        if (!user) {

          const user = new DB.User({
            facebookId: profile.id,
            username: profile.displayName
          });

          user.save();
          
          const newUser = require("./register/register");
          newUser(user);

          return cb(err, user);

        } else {

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
  function (accessToken, refreshToken, profile, cb) {

    console.log(profile);

    DB.User.findOne({googleId: profile.id}, function (err, user) {

      if (err) {

        console.log(err);

      } else {

        if (!user) {

          const user = new DB.User({
            googleId: profile.id,
            username: profile.displayName,
            avtar: profile.photos[0].value
          });
          user.save();

          const newUser = require("./register/register");
          newUser(user);

          return cb(err, user);

        } else {
          
          return cb(err, user);

        }
      }
    });
  }
));



console.log("they got me");
// let calList;
// let perList;
// let shopList;

app.get("/", function (req, res) {
  if (req.isUnauthenticated()) {
    req.session.calList = [];
    req.session.perList = [];
    req.session.shopList = [];    
  }
  res.render("index");  

});

app.get('/auth/google', passport.authenticate('google',

{scope: ['profile','email']}

));

app.get('/auth/google/todo', passport.authenticate('google', {failureRedirect: '/' }), function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/todo');

  });

app.get('/auth/facebook', passport.authenticate('facebook'));


app.get('/auth/facebook/todo', passport.authenticate('facebook', { failureRedirect: '/' }), function (req, res) {
    
    res.redirect('/todo');

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

  DB.User.register({username: req.body.username, sections: []}, req.body.password, function (err, user) {

    if (err) {

      console.log(err);
      res.redirect("/");

    } else {

      passport.authenticate("local")(req, res, function () {

        const newUser = require("./register/register");
        newUser(user);

        res.redirect("/todo");

      });
    }
  });
});

var len;

app.get("/todo", function (req, res) {

  if (req.isAuthenticated()) {  console.log(req.session);

    

    DB.User.findOne({_id: req.session.passport.user}, function (err, user) {

      if (err) {

        console.log(err);

      } else { console.log("i'm user:- "+user);
      
      global.calList = [];
      global.perList = [];
      global.shopList = [];

        user.sections.forEach(secId => { console.log(secId);

          DB.Section.findOne({_id: secId}, function (err, section) { console.log(':(');

            if (err) {
              console.log(err);

            } else { console.log(section);

              if (section.title == 'calender') { console.log("cal");

                section.lists.forEach(listId => {

                  DB.List.findOne({_id: listId}, function (err, list) { console.log(':(', list);

                    if (err) {

                      console.log(err);

                    } else {

                      // calList = [];
                      req.session.calList.push(list.title);
                      calList = req.session.calList;                      

                    }
                  });
                });

              } else if (section.title == 'personal') { console.log("per");

                section.lists.forEach(listId => {

                  DB.List.findOne({_id: listId}, function (err, list) {

                    if (err) {

                      console.log(err);

                    } else {

                    //  perList = [];
                      req.session.perList.push(list.title);
                      console.log(req.session);
                      perList = req.session.perList;
                    }
                  });
                });

              } else if (section.title == 'shoping') { console.log("shop");

                section.lists.forEach(listId => {

                  DB.List.findOne({_id: listId}, function (err, list) {

                    if (err) {

                      console.log(err);

                    } else {

                      // shopList = [];
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

    DB.User.findOne({_id: req.session.passport.user}, function (err, user) {

      if (err) {

        console.log(err);

      } else {

        var sec = req.params.sec;
        var listName = req.params.listName;
        var cal_id = user.sections[0];
        var per_id = user.sections[1];
        var shop_id = user.sections[2];
        console.log(listName);
        console.log(calList);
        console.log(perList);
        console.log(shopList);

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

        DB.Section.findOne({ _id: secId}, function (err, section) {

          if (err) {

            console.log(err);

          } else {

            const listId = section.lists[listIndex];
            req.session.items = [];
           

            DB.List.findOne({_id: listId}, function (err, list) {

              if (err) {

                console.log(err);

              } else { console.log('list 389', list); 

              var listItems = list.itemArr;
              console.log('listItem', listItems);

                res.render("home", { 
                  sections: sectionArray,
                  calList: calList,
                  perList: perList,
                  shopList: shopList,
                  sec: sec,
                  listName: listName,
                  listId:list._id,
                  listItems: listItems,
                  username: user.username,
                  avtar: user.avtar
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

    DB.User.findOne({_id: req.session.passport.user}, function (err, user) {

      if (err) {

        console.log(err);

      } else {

        var sec = req.params.sec;
        var cal_id = user.sections[0];
        var per_id = user.sections[1];
        var shop_id = user.sections[2];

        if (sec === 'calender') {

          DB.List.create({title: req.body.listTitle}, function (err, list) {

            DB.Section.findOneAndUpdate({ _id: cal_id}, {$push: {lists: [list._id]}}, {new: true}, function (err, list) {

              if (err) {

                console.log(err);

              } else {

                calList.push(req.body.listTitle);
                res.redirect("/todo/calender/today");

              }

            });
          });

        } else if (sec === 'personal') {

          DB.List.create({title: req.body.listTitle}, function (err, list) {
            
            DB.Section.findOneAndUpdate({_id: per_id}, {$push: {lists: [list._id]}}, {new: true}, function (err, list) {

              if (err) {

                console.log(err);

              } else {

                perList.push(req.body.listTitle);
                res.redirect("/todo/personal/home");

              }
            });
          });


        } else if (sec === 'shoping') {

          DB.List.create({title: req.body.listTitle}, function (err, list) {

            DB.Section.findOneAndUpdate({_id: shop_id}, {$push: {lists: [list._id]}}, {new: true}, function (err, list) {

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

    DB.User.findOne({_id: req.session.passport.user}, function (err, user) {

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

        DB.Section.findOne({_id: secId}, function (err, section) {

          if (err) {

            console.log(err);

          } else {

            const listId = section.lists[listIndex];

                            // CREAT NEW ITEM HEARE //////////

                            DB.Item.create({value: req.body.value}, function (err, item) {

                              DB.List.findOneAndUpdate({_id: listId}, {$push: {items: [item._id],itemArr: [req.body.value]}}, {new: true}, function (err, item) {
                  
                                if (err) {
                  
                                  console.log(err);
                  
                                } else {
                  
                                  res.redirect("/todo/" + sec + "/" + listName);
                  
                                }
                  
                              });
                            });
            
            
            
                            ////////////////////////////////////


          }
        });
      }
    });
  } else {
    res.redirect("/");
  }
});

var clickedItem;

app.post('/del', function (req,res) {

  const checkedId = req.body.checkbox;
  const listId = req.body.listId;  
  var params = req.body.params;
  console.log(params);
  clickedItem = req.body.listItem;
  console.log("myId "+req.body.listItem);
  // if (clickedItem != null) {
  //   DB.List.findOne({"items._id": clickedItem  }, function (err,item) {
  //     console.log("me"+item);
      
  //   })
    
  // }
  console.log('CHECKED ID',checkedId);

  DB.List.findOneAndUpdate({_id: listId}, {$pull: {itemArr: checkedId}}, function(err, foundItem) {

    if (err) {
      
      console.log(err);
      
    } else {

      DB.Item.findOneAndDelete({value: checkedId}, function (err,done) {

        if (err) {
        
        console.log(err);
        
      } else {
        console.log('done',done);
        res.redirect(params);
        
      }
    
  })      
      
    }
  });  
});

app.post('/item',function (req,res) {

  console.log(req.body.list-item);
  
})

app.post('/login', passport.authenticate('local'),function (req, res) {
   
    res.redirect("/todo");

  });



let port = process.env.PORT;

if (port == null || port == "") {
  port =1705;
}

app.listen(port || 1705, function () { //listioning on port 1705
  console.log("server is running on port 1705"); //sending msg of conformation
});
          