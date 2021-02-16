const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({// createing schema for items
    value: String,  // only contain a string element
    descreption: String,
    day: Number,
    time: Number

  });
  const Item = mongoose.model("item", ItemSchema);//creating new colection name items
  
  module.exports = Item;