const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
const Item = require("./item");
const ListSchema = new Schema({//creating schema for new list
    title: String,// containg list name
    items: [Item.ItemSchema]// containg arrey of items witch hold Item schems
  });
  
const List = mongoose.model("list", ListSchema);// creating new colection called lists

module.exports = List;