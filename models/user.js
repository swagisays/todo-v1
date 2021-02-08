const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
const findOrCreate = require('mongoose-findorcreate');


const UserSchema = new Schema({
    username: String,
    googleId: String,
    facebookId: String,   
    sections: [{      
      type: Schema.Types.ObjectId,
      ref: "Section"
    }]
  });


  
  UserSchema.plugin(passportLocalMongoose);
  UserSchema.plugin(findOrCreate);

  const User = mongoose.model("User", UserSchema);
  module.exports = User;