require('dotenv').config();
const express = require('express'); // requiring express
const bodyParser = require('body-parser'); // requiring body parser
const mongoose = require('mongoose'); //requiring mongoose for db
const passportLocalMongoose = require("passport-local-mongoose");
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook');
const passport = require("passport");

const Schema = mongoose.Schema;

const app = express(); // initialize express to app

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(253402300000000)
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




    DB.User.findOne({
      facebookId: profile.id
    }, function (err, user) {

      if (err) {

        console.log(err);

      } else {

        if (!user) {

          const user = new DB.User({
            facebookId: profile.id,
            name: profile.displayName
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



    DB.User.findOne({
      googleId: profile.id
    }, function (err, user) {

      if (err) {

        console.log(err);

      } else {

        if (!user) {

          const user = new DB.User({
            googleId: profile.id,
            name: profile.displayName,
            username: profile.email,
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





app.get("/", function (req, res) {
  if (req.isUnauthenticated()) {
    req.session.calList = [];
    req.session.perList = [];
    req.session.shopList = [];

  }
  res.render("index");

});

app.get('/auth/google', passport.authenticate('google',

  {
    scope: ['profile', 'email']
  }

));

app.get('/auth/google/todo', passport.authenticate('google', {
  failureRedirect: '/'
}), function (req, res) {
  // Successful authentication, redirect home.
  res.redirect('/todo');

});

app.get('/auth/facebook', passport.authenticate('facebook'));


app.get('/auth/facebook/todo', passport.authenticate('facebook', {
  failureRedirect: '/'
}), function (req, res) {

  res.redirect('/todo');

});

app.get("/logout", function (req, res) {

  req.logout();
  res.redirect("/");

});


let noItem = true;

const sectionArray = ['calender', 'personal', 'shoping'];

app.post("/register", function (req, res) {

  DB.User.register({
    username: req.body.username,
    name: req.body.name,
    sections: []
  }, req.body.password, function (err, user) {

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



app.get("/todo", function (req, res) {

  if (req.isAuthenticated()) {



    DB.User.findOne({
      _id: req.session.passport.user
    }, function (err, user) {

      if (err) {

        console.log(err);

      } else {

        global.calList = [];
        global.perList = [];
        global.shopList = [];

        user.sections.forEach(secId => {

          DB.Section.findOne({
            _id: secId
          }, function (err, section) {

            if (err) {
              console.log(err);

            } else {
              if (section.title == 'calender') {

                section.lists.forEach(listId => {

                  DB.List.findOne({
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

console.log(time);                   
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