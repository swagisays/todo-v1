const express = require('express');// require express
const bodyParser = require('body-parser');// require body parser
const mongoose = require('mongoose');//require mongoose for db

const app = express();// initialize express to app
app.use(bodyParser.urlencoded({//syntext to use body parser
  extended: true
}));
app.use(express.static("public"));// sending public files to user
app.set('view engine', 'ejs');// setting up ejs module
mongoose.connect("mongodb://localhost:27017/tododb");

const ItemScema = {
  value:String
};
const Item = mongoose.model("item",ItemScema);


app.get("/", function(req,res) {// geting req to rout route

  Item.find({},function (err,foundItems) {
    res.render("list", {//sending data to ejs list template
         kindOfDay: "today",//storing date in kindaofday ejs variable
         item: foundItems//storing item arrey in ejs items variable
       });

  })
})

app.post("/", function(req, res) {// geting list items from user
  let itemValue = req.body.newItem;//storing list newitem to item
  const newItem = new Item({
    value:itemValue
  });
  newItem.save();
  res.redirect("/");//redirecting to get request
});
app.post("/delete",function (req,res) {
  const checkedId = req.body.checkbox;
  Item.findByIdAndRemove(checkedId ,function (err) {
    console.log(err);
    res.redirect("/");
  });

})

app.listen(1705, function() {//listioning on port 1705
  console.log("server is running on port 1705");//sending msg of conformation
});
