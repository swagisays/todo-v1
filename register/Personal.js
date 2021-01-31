const mongoose = require('mongoose');
const DB = require("../models/index");

function Personal(user) {

    const per_id = user.sections[1];

    const sectionId = per_id;

    const listItems = ['Home', 'Work'];

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
            }, function (err, section) {
                if (err) {
                    console.log(err);
                }
            });

        });

    }); 
    return per_id;
}

module.exports = Personal;