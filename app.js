
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

// let items = [];
// let workItems = [];

//to use "ejs" 
app.set("view engine", "ejs");
//to use body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//database
mongoose.connect('mongodb://127.0.0.1:27017/toDoListDB',{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
//schema
const itemsSchema = {
    name: String
};
/***************************************************DataBase****************************************/
//mongoose model
const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: "hit the + button"
});

const item2 = new Item({
    name: "Rishabh"
});

const item3 = new Item({
    name: "Kumar"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



/***************************************************get Method****************************************/
app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log("err");
                } else {
                    console.log("added to database");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    });

    // let today = new Date();

    // let options = {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // };
    // let day = today.toLocaleDateString("en-US", options);
});
//dinamic router
app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                //create new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            } else {
                //show an existing list
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    });
});

app.get("/School", (req, res) => {
    res.render("School");
});

/***************************************************post Method****************************************/

// to post on server
app.post("/", (req, res) => {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }




    // console.log(req.body)

    // if (req.body.list === "work List") {
    //     workItems.push(item);
    //     res.redirect("/work");
    // } else {
    //     items.push(item)
    //     res.redirect("/");
    // }

});

app.post("/work", (req, res) => {
    let item = res.body.newItem;
    workItems.push(item);
    res.redirect("/work")
});

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndDelete(checkedItemId, (err) => {
            if (!err) {
                console.log("successfully deleted");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, (err, foundList) => {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }
});




// port == 3000
app.listen(3000, () => {
    console.log("sercver is live");
});