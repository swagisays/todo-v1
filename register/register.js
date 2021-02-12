const DB = require("../models/index");

function newUser(user) { 

const sectionItems = ['calender', 'personal', 'shoping'];          

sectionItems.forEach(item => {
  DB.Section.create({title: item}, function (err, section) {

    DB.User.findOneAndUpdate({_id: user._id}, {$push: {sections: [section._id]}}, {new: true}, function (err, user) {

      if (err) {

        console.log(err);

      } else {

        if (item === 'calender') {

          const Calender = require("./Calender");
          Calender(user);

        } else if (item === 'personal') {
          const Personal = require("./Personal");
          Personal(user);

        } else if (item === 'shoping') {
          const Shoping = require("./Shoping");
          Shoping(user);

        }

      }
    });
  });
});

}

module.exports = newUser;