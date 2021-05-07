//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

/*connecting to mongodb server*/
mongoose.connect("mongodb+srv://admin-username:password@cluster0.xqekq.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true});

/*creating a structure for data*/
const itemsSchema=new mongoose.Schema({
  name:String
});

/*creaating collection*/
const Item=mongoose.model("Item",itemsSchema);


/*creating document*/
const item1=new Item({
  name:"Buy food"
});
const item2=new Item({
  name:"Cook food"
});
const item3=new Item({
  name:"Eat food"
});
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find(function(err,foundItems){
    /*if no items present in the list then we put the default values otherwise all those items which are present in the lists*/
      if(foundItems.length==0)
      {
        Item.insertMany(defaultItems,function(err){
          if(err)
          {
            console.log(err);
          }
          else
          {
            console.log("Insert successfully");
          }
        });
        res.redirect("/");
      }
      else
      {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});
app.post("/", function(req, res){

  const itemName=req.body.newItem;
  const listName=req.body.list;
  /*creating a document when user enter a text and submit it*/
  const item4=new Item({
    name:itemName
  });
  if(listName==="Today")
  {
    item4.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});
app.post("/delete",function(req,res){
  const checkedItemID=req.body.checkBox;
  const listName=req.body.listName;
  if(listName==="Today")
  {
    Item.findByIdAndDelete(checkedItemID,function(err){
    res.redirect("/");
    })
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    })
  }

});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

/*creating route dynamically*/
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
      if(!err)
      {
        if(!foundList)
        {
          //create a new list
          const list=new List({
            name:customListName,
            items:defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
        }
        else
        {
          // show the list
          res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
        }
      }
    });
    // if(result.name==customListName)
    // {
    //   console.log("Already have a route");
    // }
    // else
    // {
    //    // list.save();
    // }


});


app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
