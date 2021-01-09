const express = require('express');// require express
const bodyParser = require('body-parser');// require body parser
const mongoose = require('mongoose');//require mongoose for db

const app = express();// initialize express to app
app.use(bodyParser.urlencoded({//syntext to use body parser
  extended: true
}));
app.use(express.static("public"));// sending public files to user
app.set('view engine', 'ejs');// setting up ejs module
mongoose.connect("mongodb://localhost:27017/tododb", { useUnifiedTopology: true , useNewUrlParser: true});
mongoose.set('useFindAndModify', false);

const ItemSchema = {
  value:String
};
const Item = mongoose.model("item",ItemSchema);

const ListSchema = {
  name:String,
  items:[ItemSchema]
}
const List = mongoose.model("list",ListSchema);


app.get("/", function(req,res) {// geting req to rout route

  Item.find({},function (err,foundItems) {
    if (foundItems.length===0) {
      res.render("list",{
        listTitle: "Today",
        noItem: true
      });
    } else {
      res.render("list", {//sending data to ejs list template
           listTitle: "Today",//storing date in kindaofday ejs variable
           noItem: false,
           item: foundItems//storing item arrey in ejs items variable
         });
    }


  });
});

app.get("/:customList",function (req,res) {
  const customListName = req.params.customList;

    List.findOne({name: customListName},function (err,foundList) {
    if (!err) {
      if (!foundList) {
        // create new list
        list = new List({
          name:customListName,
          items:[]
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        if (foundList.items.length==0) {
          res.render("list",{
            listTitle: foundList.name,
            noItem: true
          });
        } else{
          // show exsisting one
          res.render("list", {//sending data to ejs list template
               listTitle: foundList.name,//storing date in kindaofday ejs variable
               noItem: false,
               item: foundList.items//storing item arrey in ejs items variable
             });
        }


      }
    }

  })

});

app.post("/", function(req, res) {// geting list items from user
  let itemValue = req.body.newItem;//storing list newitem to item
  const listName = req.body.list;
  const newItem = new Item({
    value:itemValue
  });
  if (listName==="Today") {
    newItem.save();
    res.redirect("/");//redirecting to get request
  } else {
    List.findOne({name: listName}, function (err,foundList) {
      if (!err) {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }

});
app.post("/delete",function (req,res) {
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName==="Today") {
    Item.findByIdAndRemove(checkedId ,function (err) {
      console.log(err);
      res.redirect("/");
    });
  } else {

    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}, function (err,foundItem) {
      if (!err) {

        res.redirect("/" + listName);
      }
    })
  }

})

app.listen(1705, function() {//listioning on port 1705
  console.log("server is running on port 1705");//sending msg of conformation
});
