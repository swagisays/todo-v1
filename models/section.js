const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;


const SectionSchema = new Schema({
  title: String,
  lists: [{
      type: Schema.Types.ObjectId,
      ref: "List"
  }]
});

const Section = mongoose.model("section", SectionSchema);
module.exports = Section;
        