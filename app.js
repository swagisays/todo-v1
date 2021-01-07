const express = require('express');// require express
const bodyParser = require('body-parser');// require body parser

const app = express();// initialize express to app
app.use(bodyParser.urlencoded({//syntext to use body parser
  extended: true
}));
app.use(express.static("public"));// sending public files to user
app.set('view engine', 'ejs');// setting up ejs module
var items = [];// arrey to store todo list items


app.get("/", function(req,res) {// geting req to rout route
  const day = new Date();// useing jave to display local date
  const options = {//seting up date schema
    weekday: "long",//weekday as full String
    day: "numeric",// day in numeric digit
    month: "long",// month in full string
  }
  const today = day.toLocaleDateString("en-US", options);//store date in today const

  res.render("list", {//sending data to ejs list template
    kindOfDay: today,//storing date in kindaofday ejs variable
    item: items//storing item arrey in ejs items variable
  });

})

app.post("/", function(req, res) {// geting list items from user
  let item = req.body.newItem;//storing list newitem to item
  items.push(item);//pushing new item into items array
  res.redirect("/");//redirecting to get request

})

app.listen(1705, function() {//listioning on port 1705
  console.log("server is running on port 1705");//sending msg of conformation
})
