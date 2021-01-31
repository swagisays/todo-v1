const mongoose = require('mongoose');
const DB = require("../models/index");

function Calender(user) {
    const cal_id = user.sections[0]; 

    const sectionId = cal_id;

    const listItems = ['Today', 'Tomorrow', 'Some Day'];

    listItems.forEach(item => {

        DB.List.create({
            title: item
        }, function (err, list) {

            DB.Section.findOneAndUpdate({
                _id: sectionId
            }, {
                $push: {
                    lists: [list._id]
                }
            }, {
                new: true
            }, function (err, list) {
                if (err) {
                    console.log(err);
                }
            });

        });

    });
    return cal_id;

}


module.exports = Calender;