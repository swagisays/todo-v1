const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.set('view engine', 'ejs');

app.get("/", function(req, res) {
  const day = new Date();
  const currentDay = day.getDay();


  switch (currentDay) {
    case 1:
      var Day = "Monday";
      break;
    case 2:
      var Day = "Tuesday";
      break;
    case 3:
      var Day = "Wednesday";
      break;
    case 4:
      var Day = "Thursday";
      break;
    case 5:
      var Day = "Friday";
      break;
    case 6:
      var Day = "Saturday";
      break;
    case 7:
      var Day = "Sunday";
      break;

    default:
      console.log("the currentDay is " + currentDay);

  }
  res.render("list",{day:Day});
})
app.listen(1705, function() {
  console.log("server is up and running");
})
