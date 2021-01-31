const mongoose = require('mongoose');
const DB = require("../models/index");

function Shoping(user) {
    const sho_id = user.sections[2];

    const sectionId = sho_id;

    const listItems = ['Grocery'];

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
                } else {

                }
            })

        });

    });
    return sho_id;

}

module.exports = Shoping;