const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
// const Item = require("./item");
const ListSchema = new Schema({//creating schema for new list
    title: String,// containg list name
    itemArr: [],
    items: [{
      type: Schema.Types.ObjectId,
      ref: "Item"
    }]// containg arrey of items witch hold Item schems
  });
  
const List = mongoose.model("list", ListSchema);// creating new colection called lists

module.exports = List;