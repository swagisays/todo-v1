require('dotenv').config(); // require dotenv npm module for env files
const express = require('express'); // requiring express
const bodyParser = require('body-parser'); // requiring body parser
const mongoose = require('mongoose'); //requiring mongoose for db
const passportLocalMongoose = require("passport-local-mongoose");// requiring passport librery for mongoose system
const session = require('express-session');// express session to make login session
const GoogleStrategy = require('passport-google-oauth20').Strategy;// google login strategy from passport
const FacebookStrategy = require('passport-facebook');// passport fb module
const passport = require("passport");// passport module for auth

const Schema = mongoose.Schema;// shorthand to initialize schema

const app = express(); // initialize express to app

app.use(bodyParser.urlencoded({extended: true})); // initialize body parser

app.use(session({ // starting session
  secret: process.env.SECRET, // secret to secure session
  resave: false, 
  saveUninitialized: false,
  cookie: {
    expires: new Date(253402300000000) // making cookie to save forever
  }
}));

app.use(passport.initialize()); // initialize passport
app.use(passport.session()); // starting session in passport

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




app.use(express.static(__dirname + '/public')); // sending public files to user
app.use('/todo/calender', express.static(__dirname + '/public')); // sending public files to user on a path
app.use('/todo/personal', express.static(__dirname + '/public')); // sending public files to user on a path
app.use('/todo/shoping', express.static(__dirname + '/public')); // sending public files to user on a path

app.set('view engine', 'ejs'); // setting up ejs module to views dir

const DB = require("./models/index"); // getting Data base schema from this path

passport.use(DB.User.createStrategy()); // creating an strategy for user schema

passport.serializeUser(function (user, done) { // serializeing user via passport

  done(null, user.id);

});

passport.deserializeUser(function (id, done) { // deserialize user via passport

  DB.User.findById(id, function (err, user) {
    done(err, user);
  });

});

passport.use(new FacebookStrategy({ // facebook auth
    clientID: process.env.FB_APPID, // client id from env file
    clientSecret: process.env.FB_SECRET, // client secret from env file
    callbackURL: "http://localhost:1705/auth/facebook/todo" // callback url when user authenticated
  },
  function (accessToken, refreshToken, profile, cb) { // getting profile data from fb


    DB.User.findOne({ // finding user in our DB
      facebookId: profile.id // via their fb Id
    }, function (err, user) { // if user is allready exist

      if (err) {

        console.log(err); // on err log them on console

      } else {

        if (!user) { // if user is not exist in DB

          const user = new DB.User({ // create new user
            facebookId: profile.id, // saving their fb Id in DB to know them in future
            name: profile.displayName // save their name in db
          });

          user.save(); // save user data to DB

          const newUser = require("./register/register"); // going through rigister process
          newUser(user); // giving user data to register process

          return cb(err, user); 

        } else {

          return cb(err, user);

        }
      }
    });
  }
));

passport.use(new GoogleStrategy({ // google auth by passport
    clientID: process.env.GOOGLE_CLIENT_ID, // clientID in env 
    clientSecret: process.env.GOOGLE_SECRET, // client secret in env
    callbackURL: "http://localhost:1705/auth/google/todo" // callback url when auth is done
  },
  function (accessToken, refreshToken, profile, cb) { // profile data by google

    DB.User.findOne({ // find user in our DB
      googleId: profile.id // by their googleId
    }, function (err, user) { // callback fun

      if (err) { // if err log them

        console.log(err);

      } else {

        if (!user) { // if user not exist create em!

          const user = new DB.User({ // creating new user
            googleId: profile.id, // saving their google id
            name: profile.displayName, // saving their username
            username: profile.email, // save email
            avtar: profile.photos[0].value // save their avtar in DB
          });
          user.save(); // saving data to DB

          const newUser = require("./register/register"); // process to register new user
          newUser(user);

          return cb(err, user);

        } else {

          return cb(err, user);

        }
      }
    });
  }
));



// home route

app.get("/", function (req, res) { 
  if (req.isUnauthenticated()) { // if user is not authenticated 
    req.session.calList = []; // create list array in login session
    req.session.perList = [];
    req.session.shopList = [];

  }
  res.render("index");

});

// google auth route
app.get('/auth/google', passport.authenticate('google', 

  {
    scope: ['profile', 'email'] // define scope to google auth
  }

));

// google redirect route
app.get('/auth/google/todo', passport.authenticate('google', {
  failureRedirect: '/'
}), function (req, res) {
  // Successful authentication, redirect todo page.
  res.redirect('/todo');

});

// fb auth route
app.get('/auth/facebook', passport.authenticate('facebook'));

// fb redirect route
app.get('/auth/facebook/todo', passport.authenticate('facebook', {
  failureRedirect: '/' // if auth faile redirect to home route
}), function (req, res) {
// Successful authentication, redirect todo page.
  res.redirect('/todo');

});

// logout route
app.get("/logout", function (req, res) {

  req.logout(); // log out user from session
  res.redirect("/"); // redirect to home

});


let noItem = true; //initialize no item to true as a global var

const sectionArray = ['calender', 'personal', 'shoping']; // section array

app.post("/register", function (req, res) { // register post route

  DB.User.register({ // creating new user
    username: req.body.username, // save email in username section
    name: req.body.name, // save user name in user model 
    sections: [] // creating an empty array of section 
  }, req.body.password, function (err, user) { // salting password and return user

    if (err) { // if any error log it and reffer to home screen

      console.log(err);
      res.redirect("/");

    } else {

      passport.authenticate("local")(req, res, function () { // authenticat user via passport local

        const newUser = require("./register/register"); // ging through registration precess
        newUser(user); // like saving list and section

        res.redirect("/todo"); // redirect to todo route

      });
    }
  });
});



app.get("/todo", function (req, res) {

  if (req.isAuthenticated()) { // if user is authenticated

    DB.User.findOne({ // find user by user id
      _id: req.session.passport.user
    }, function (err, user) {

      if (err) {

        console.log(err);

      } else {

        global.calList = [];// creating global array for sections
        global.perList = [];
        global.shopList = [];

        user.sections.forEach(secId => { // run for each loop on sections

          DB.Section.findOne({ // got the section id
            _id: secId
          }, function (err, section) {

            if (err) {
              console.log(err);

            } else {
              if (section.title == 'calender') {

                section.lists.forEach(listId => {

                  DB.List.findOne({ // create list for section
                    _id: listId
                  }, function (err, list) {

                    if (err) {

                      console.log(err);

                    } else {

                      // calList = [];
                      req.session.calList.push(list.title);
                      calList = req.session.calList;

                    }
                  });
                });

              } else if (section.title == 'personal') {
                section.lists.forEach(listId => {

                  DB.List.findOne({
                    _id: listId
                  }, function (err, list) {

                    if (err) {

                      console.log(err);

                    } else {

                      //  perList = [];
                      req.session.perList.push(list.title);

                      perList = req.session.perList;
                    }
                  });
                });

              } else if (section.title == 'shoping') {

                section.lists.forEach(listId => {

                  DB.List.findOne({
                    _id: listId
                  }, function (err, list) {

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


        res.redirect("/todo/calender/today"); // registration process done now redirect to today list

      }
    });


  } else {

    res.redirect("/");

  }
});

app.get("/todo/:sec/:listName", function (req, res) { // list routes

  if (req.isAuthenticated()) { // check if user authenticated

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
            req.session.items = [];


            DB.List.findOne({
              _id: listId
            }, function (err, list) {

              if (err) {

                console.log(err);

              } else {





                ///// date //////
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();          
                

                function formatAMPM(date) {
                  var hours = date.getHours();
                  var minutes = date.getMinutes();
                  var ampm = hours >= 12 ? 'pm' : 'am';
                  hours = hours % 12;
                  hours = hours ? hours : 12; // the hour '0' should be '12'
                  minutes = minutes < 10 ? '0'+minutes : minutes;
                   var strTime = hours + ':' + minutes;
                  return strTime;
                }
                var time = formatAMPM(today);
                console.log(time);
                
                

                today = mm + '/' + dd + '/' + yyyy;

                //// date close ///////

                if (user.name.length >12) {

                  var name = user.name.slice(0, 11) + '...';
                  
                }else{
                  var name = user.name;
                }

                if (list.itemArr.length === 0) {                 

                  
                  res.render("home", {
                    sections: sectionArray,
                    calList: calList,
                    perList: perList,
                    shopList: shopList,
                    sec: sec,
                    listName: listName,
                    listId: list._id,                    
                    username: user.username,
                    name: name,
                    avtar: user.avtar,
                    time: time,
                    secTitle:  req.params.sec,               
                    today: today,                    
                    noItem: true
                  });                 
                  
                } else {

                  if (!req.session.clickedItem) {

                    var firstItemId = list.items[0];

                    DB.Item.findOne({_id: firstItemId}, function (err,item) {
  
                      if (err) {
  
                        console.log(err);
                        
                      } else {
                        req.session.clickedItem = item;
                        console.log(item);
                        
                    res.render("home", {
                      sections: sectionArray,
                      calList: calList,
                      perList: perList,
                      shopList: shopList,
                      sec: sec,
                      listName: listName,
                      listId: list._id,
                      listItems: list.itemArr,
                      username: user.username,
                      name: name,
                      avtar: user.avtar,
                      today: today,
                      time: time,                      
                      clickedItem: req.session.clickedItem.value,
                      description: req.session.clickedItem.descreption,
                      gotTime: time,
                      date: req.session.clickedItem.date,
                      noItem: false
                    });
                      }
                      
                    })


                    
                  } else {

                    res.render("home", {
                      sections: sectionArray,
                      calList: calList,
                      perList: perList,
                      shopList: shopList,
                      sec: sec,
                      listName: listName,
                      listId: list._id,
                      listItems: list.itemArr,
                      username: user.username,
                      name: name,
                      avtar: user.avtar,
                      today: today,
                        clickedItem: req.session.clickedItem.value,
                      description: req.session.clickedItem.descreption,
                      time: time,
                      gotTime: req.session.clickedItem.time,
                      date: req.session.clickedItem.date,
                      noItem: false
                    });
                    


                  }

 
                }
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

            // CREAT NEW ITEM HEARE //////////

            DB.Item.create({
              value: req.body.value
            }, function (err, item) {

              req.session.clickedItem = item;
              noItem = false;

              DB.List.findOneAndUpdate({
                _id: listId
              }, {
                $push: {
                  items: [item._id],
                  itemArr: [req.body.value]
                }
              }, {
                new: true
              }, function (err, item) {

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

app.post('/del', function (req, res) {

  const checkedId = req.body.checkbox;
  const listId = req.body.listId;
  var params = req.body.params;
  var clickedItem = req.body.listItem;
  



  if (clickedItem != null & checkedId == null) {

    DB.List.findOne({ _id: listId}, function (err, list) {

      if (err) {
        console.log(err);

      } else {
        console.log(clickedItem);
        const itemIndex = list.itemArr.indexOf(clickedItem);
        var itemId = list.items[itemIndex];

        DB.Item.findOne({ _id: itemId}, function (err, item) {
          if (err) {

            console.log(err);

          } else {

            req.session.clickedItem = item;
            console.log(item);     
             res.redirect(params);   
          }
        });
      }
         
    });


    
  }

  if(checkedId != null){

    DB.List.findOne({_id: listId}, function (err, list) {

      if (err) {
        console.log(err);
  
      } else {
  
        const itemIndex = list.itemArr.indexOf(checkedId);
  
        const itemId = list.items[itemIndex];
        console.log('itemIndex', itemIndex);
        console.log(itemIndex - 1);
        var index = itemIndex - 1;
        if (index === -1) {
          noItem = true;
          
        } else {
  
          const itemIdBefore = list.items[index];
          DB.Item.findOne({_id: itemIdBefore}, function (err, item) {
  
            if (err) {
              console.log(err);
              
            } else {
              req.session.clickedItem = item;
          console.log(req.session.clickedItem);
            }
            
          })
          
        }
        
  
  
        DB.Item.findOneAndDelete({_id: itemId}, function (err, done) {
  
          if (err) {
  
            console.log(err);
  
          } else {
  
            DB.List.findOneAndUpdate({_id: listId}, {$pull: {itemArr: checkedId, items: itemId }}, function (err, delItem) {
  
              if (err) {
  
                console.log(err);
  
              } else {
  
                res.redirect(params);
  
              }
  
            });
  
  
          }
  
        })
      }
  
    })//    
  }



});

app.post('/todo/:sec/:listName/:item', function (req, res) {

  const itemValue = req.params.item;
  var listId = req.body.listId;
  var params = "/todo/" + req.params.sec + "/" + req.params.listName;
  DB.List.findOne({
    _id: listId
  }, function (err, list) {

    if (err) {

      console.log(err);

    } else {

      const itemIndex = list.itemArr.indexOf(itemValue);

      DB.List.updateOne({
        _id: listId,
        itemArr: itemValue
      }, {
        $set: {
          "itemArr.$": req.body.itemValue
        }
      }, function (err) {
        if (err) {

          console.log(err);

        } else {


          const itemId = list.items[itemIndex];

          const modItem = {
            value: req.body.itemValue,
            descreption: req.body.description,
            date: req.body.date,
            time: req.body.time
          }

          DB.Item.findOneAndUpdate({
            _id: itemId
          }, modItem, {
            new: true
          }, function (err, item) {

            if (err) {

              console.log(err);

            } else {


              req.session.clickedItem = item;
              console.log('change item', item);
              res.redirect(params);


            }

          })
        }

      })

    }

  })

});

app.post('/login', passport.authenticate('local'), function (req, res) {

  res.redirect("/todo");

});



let port = process.env.PORT;

if (port == null || port == "") {
  port = 1705;
}

app.listen(port || 1705, function () { //listioning on port 1705
  console.log("server is running on port 1705"); //sending msg of conformation
});