require('dotenv').config();
const express = require('express'); // requiring express
const bodyParser = require('body-parser'); // requiring body parser
const mongoose = require('mongoose'); //requiring mongoose for db

const app = express(); // initialize express to app
app.use(bodyParser.urlencoded({ //syntext to use body parser
  extended: true
}));
app.use(express.static("public")); // sending public files to user
app.set('view engine', 'ejs'); // setting up ejs module

mongoose.connect(process.env.MDB_CONNECT+"/tododb", {// createing tododb data base & running mongodb server on local host
  useUnifiedTopology: true,// removing depication WARNING
  useFindAndModify: false,// removing depication WARNING
  useNewUrlParser: true// removing depication WARNING
});

// mongoose.connect("mongodb://localhost:27017/tododb", {// createing tododb data base & running mongodb server on local host
//   useUnifiedTopology: true,// removing depication WARNING
//   useFindAndModify: false,// removing depication WARNING
//   useNewUrlParser: true// removing depication WARNING
// });

const ItemSchema = {// createing schema for items
  value: String// only contain a string element
};
const Item = mongoose.model("item", ItemSchema);//creating new colection name items

const ListSchema = {//creating schema for new list
  name: String,// containg list name
  items: [ItemSchema]// containg arrey of items witch hold Item schems
}
const List = mongoose.model("list", ListSchema);// creating new colection called lists

app.get("/", function(req, res) { // geting req to home root

  Item.find({}, function(err, foundItems) {// finding elements in list
    if (foundItems.length === 0) {// if their's no element
      res.render("list", {// send data to list
        listTitle: "Today",// sending list title
        noItem: true//making no item var to true
      });
    } else {// if their have some elements present
      res.render("list", { //sending data to ejs list template
        listTitle: "Today", // sending list title
        noItem: false,// their have elements so sending false
        item: foundItems //storing item arrey in ejs items variable
       });
    }//else end
  });//find item end
});// get reqest end

app.get("/:custumList", function(req, res) {// geting custom list made by user
  let custumListUser = req.params.custumList;// making get req to custom list
  let custumListName = custumListUser[0].toUpperCase() + custumListUser.slice(1).toLowerCase();//changing custom list first letter to upper case and remaning lowecase

  List.findOne({name: custumListName}, function(err, foundList) {// finding if list is exist or not
    if (!err) {// if their is no error
      if (!foundList) {// if list is not exist create new list
        list = new List({// creating new list
          name: custumListName,// applying custom name to list
          items: []//storing a empty arry coz their's non items yet
        });// new list close
        list.save();// save new list to data base
        res.redirect("/" + custumListName);// redirecting to new list page
      } else {  // if list is already exist then showing the list
        if (foundList.items.length == 0) {// if their's no items in list
          res.render("list", {// sending data to list or list.ejs
            listTitle: foundList.name,// sending list  title to list.ejs
            noItem: true// no items so send true in list.ejs
          });// sending data compleate
        } else {// if their has items in list so send them to list.ejs
            res.render("list", { //sending data to ejs list template
            listTitle: foundList.name, //storing list name in ejs listTitle variable
            noItem: false,// their has items so no items is false send to list.ejs
            item: foundList.items //storing item arrey in ejs items variable
          });
        }// child else statement end
      }// parent else statement end
    }// whole if element end which say's no error
    else{// if their has error
      console.log(err);// log(show) error to console
    }//error else end

  });// find element's in list end

});// custom list get route end

app.post("/", function(req, res) { // geting list items from user
  let itemValue = req.body.newItem; //storing list item to itemValue
  if (itemValue.length>20) {// chacking if the input text is larger than 20
    itemValue = itemValue.slice(0,20);// making text only 20 elements long
  }
  const listName = req.body.list;//storing list name to listName const
  const newItem = new Item({// creating new item
    value: itemValue
  });
  if (listName === "Today") {// if list is on home route
    newItem.save();// save new items
    res.redirect("/"); //redirecting to home route
  } else {// if list isn't on home route
    List.findOne({// finding witch list it is
      name: listName//finding list to db via it's name
    }, function(err, foundList) {// when list found call back
      if (!err) {// if their's no error
        foundList.items.push(newItem);// push new items to list item array
        foundList.save();// save the list item to collection
        res.redirect("/" + listName);// redirect to list route
      }// if statement extended
      else{// if their has error
        console.log(err);// write error to console
      }//else statement end
    });// end of finding list
  }// else statement end witch check's we aren't on home route

});// geting element post req end

app.post("/delete", function(req, res) {// post req if user want to deleate an item
  const checkedId = req.body.checkbox;// geting checkbox id witch user clicked on
  const listName = req.body.listName;// geting list name weare change happen
  if (listName === "Today") {// checking if list is on home route
    Item.findByIdAndRemove(checkedId, function(err) {// finding item by it's id and remove them
      res.redirect("/");// redirect to home route
    });// finding and removeing item done
  } else {// if item isn't on home route
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}, function(err, foundItem) {
        // finding element from db by it's list name then pulling array item by it's id
      if (!err) {// if their isn't have error
        res.redirect("/" + listName);// redirect to list route
      }else {
        console.log(err);// if error happen log to console
      }// else statement end
    });// finding and deleateing element done
  }// end of else statement
});//deleteing elements post req end

let port = process.env.PORT;
if (port==null || port=="") {
  port=1705;
}

app.listen(port || 1705, function() { //listioning on port 1705
  console.log("server is running on port 1705"); //sending msg of conformation
});
