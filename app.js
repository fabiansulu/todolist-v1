//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//Create or connect database
mongoose.connect("mongodb+srv://authentik:server123@cluster0.aivadwr.mongodb.net/todolistDB");

const itemsSchema = { name: String };
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "Welcome to your Todolist !"});
const item2 = new Item({name: "To add task click on the + !"});
const item3 = new Item({name: "<-- Use that checkbox to delete task !"});

let defaultItems = [item1, item2, item3];

const listSchema = {
    name: String, 
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

    Item.find({}).then((foundItems) => {

        if(foundItems.length === 0){
            Item.insertMany(defaultItems).then((err) => {
                if(err){console.log(err)}
                else{console.log("Successfully inserted")}
            });
            res.redirect("/");
        } else {
            console.log("Items well founded");
            res.render("list", 
            {listTitle: "Today", newListItems: foundItems });}
    });
});

app.get("/:customListName", function(req, res){
    const customListName =  _.capitalize(req.params.customListName);

    List.findOne({name: customListName})
        .then(function(foundList){
            
            if(foundList === null){
               
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                console.log("saved !");
                res.redirect("/" + customListName); 
            }  else {
                
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items});
            }
        
         
        });
        //.catch(function(e){console.log(e);})
       
});


app.post("/", function(req, res){
    
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const itemInPost = new Item({name: itemName});

   if (listName === "Today"){
        itemInPost.save();
        res.redirect("/");
   } else {
        List.findOne({name: listName})
        .then(function (foundList){
            foundList.items.push(itemInPost);
            foundList.save();
        });
        res.redirect("/" + listName);
   }
});

app.post("/delete", async function(req, res){

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listNamehidden;

    if (listName === "Today"){
        Item.findByIdAndRemove(checkedItemId).then(function(foundItem){
            Item.deleteOne({_id: checkedItemId});
            console.log("Successfully removed..!"); 
            res.redirect("/");
        });
    } else{
        await List.findOneAndUpdate( 
            {name: listName},
            {$pull: {items: {_id:checkedItemId}}});
        res.redirect("/" + listName);
    }




    
    
});


app.get("/about", function(req, res){
    res.render("about");
  });

app.listen(3000, function () {
  console.log("Server is up and running on port 3000");
});