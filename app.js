const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
var items = [];


app.get("/", function(req, res) {
  var day = new Date();
  var options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  }
  var today = day.toLocaleDateString("en-US", options);

  res.render("list", {
    kindOfDay: today,
    item: items
  });

})

app.post("/", function(req, res) {
  var item = req.body.newItem;
  items.push(item);
  res.redirect("/");

})

app.listen(1705, function() {
  console.log("server is running on port 1705");
})
