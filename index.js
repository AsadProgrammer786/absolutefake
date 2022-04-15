const express = require("express");
const fs = require("fs");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 1000;
const path = require("path");
app.listen(port, () => {
    console.log("Server Has Started!");
});
app.use(cors());
app.use("/meme-images", express.static(__dirname + '/meme-images'));
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use(express.urlencoded({extended:true}));
const mongoose = require("mongoose");
mongoose.connect('mongodb+srv://snips:snips@cluster0.hscsw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {useNewUrlParser : true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, "error"));
db.once('open', ()=>{
    console.log("Database Connected!");
});

app.get("/", (req, res) => {
    res.end("This Is API, Not Your Personal Website, So Check It's Documentation!");
});
const memeStruc = mongoose.Schema({
    title : String,
    src : String,
    liked : Array,
    comments : Array
});
const accountStruc = mongoose.Schema({
    name : String,
    email : String,
    password : String,
});
var meme = mongoose.model("memeApi", memeStruc);
var acc = mongoose.model("acc", accountStruc);
app.get("/getmeme/:id", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept,Authorization"
    );
    var id = req.path;
    id = id.replace("/getmeme/:", "");
    id = parseInt(id);
    var myArr = new Array();
    meme.find({}, (err, memes) => {
        memes = memes.reverse();
        for(var i = 0;i<id;i++) {
            if(memes[i] == undefined) {
                break;
            }
            else {
                myArr.push(memes[i]);
            }
        }
        setTimeout(() => {
            var nextArr = shuffleArray(myArr);
            res.send(nextArr);
        }, 500);
    });
});
app.get("/makeAccount/:id", (req, res) => {
    var item = req.path;
    var i1 = item.indexOf("+");
    var name = item.substring(13, i1);
    item = item.slice(i1+1);
    var i2 = item.indexOf("+");
    var gmail = item.substring(0, i2);
    acc.find({email : gmail}, (err, accs) => {
        if(accs.length>0) {
            res.send("No");
        }
        else {
            item = item.slice(i2+1);
    var pass = item;
    name = name.replace("%20", " ");
    var myArr ={
        name : name,
        email : gmail,
        password : pass
    };
    var data = new acc(myArr);
    data.save()
    .then(res.send("Yes"));
        }
    })
    
});

app.get("/login/:id", (req, res) => {
    var item = req.path;
    item = item.replace("/login/", "");
    var i1 = item.indexOf("+");
    var email = item.substring(0, i1);
    var pass = item.slice(i1+1);
    console.log("login");
    acc.find({email : email, password : pass}, (err, user) => {
        if(user.length>0) {
            res.send(user[0]['name']);
        }
        else {
            res.send("no");
        }
    });
});
app.get("/postComment/:id", (req, res) => {
    var item = req.path;
    item = item.replace("/postComment/", "");
    var i1 = item.indexOf("+");
    var imageName = item.substring(0, i1);
    item = item.slice(i1+1);
    var i2 = item.indexOf("+");
    var myName = item.substring(0, i2);
    item = item.slice(i2+1);
    var commentText = item;
    for(i = 0;i<=10;i++) {
        myName = myName.replace("%20", " ");
        commentText = commentText.replace("%20", " ");
    }
    var myArr = {
        "Name" : myName,
        "Comment" : commentText
    };
        meme.find({src : "./meme-images/"+imageName+".png"}, (err, memes) => {
            var commentArr = memes[0]['comments'];
            commentArr.push(myArr);
            var newValues = { $set: {title : memes[0]['title'], src : memes[0]['src'], liked : [], comments : commentArr} };
            var myQuery =  { title : memes[0]['title'] };
            meme.updateOne(myQuery, newValues, (err, r) => {
                if(r)
                res.send("yes");
            });
        });
    });

function shuffleArray(arr) {
    var i = 0;
    var newArr = arr;
    while(i<1000) {
        var a = Math.random() * arr.length;
        a = a.toFixed(0);
        var b = Math.random() * arr.length;
        b = b.toFixed(0);
        var c = newArr[a];
        var d = newArr[b];
        if(a==b) {
            // Eat Five Star
        }
        else {
            newArr[b] = c;
            newArr[a] = d;
        }
        i++;
    }
    return newArr;
}

app.get("/registerLike/:id", (req, res) => {
    var item = req.path;
    item = item.replace("/registerLike/", "");
    var i1 = item.indexOf("+");
    var src = item.substring(0, i1);
    var gMail = item.slice(i1+1);
    meme.find({src : "./meme-images/"+src}, (err, memes) => {
        var likedArr = memes[0]['liked'];
            likedArr.push(gMail);
            var newValues = { $set: {title : memes[0]['title'], src : memes[0]['src'], liked : likedArr, comments : memes[0]['comments']} };
            var myQuery =  { title : memes[0]['title'] };
            meme.updateOne(myQuery, newValues, (err, r) => {
                if(r)
                res.send("yes");
            });
    });
});

app.get("/getLikedMeme/:id", (req, res) => {
    var item = req.path;
    var gMail = item.slice(14);
    var a = 0;
    var myArr = new Array();
    meme.find({}, (err, memes) => {
        var l = memes.length;
        for(var i = 0;i<l;i++) {
            var liked = memes[i]['liked'];
            if(liked.includes(gMail))
            {
                myArr.push(memes[i]);
            }
        }
        setTimeout(() => {
            res.send(myArr);
        }, 500);
    });
});

app.get("/unregisterLike/:id", (req, res) => {
    var item = req.path;
    item = item.replace("/unregisterLike/", "");
    var i1 = item.indexOf("+");
    var src = item.substring(0, i1);
    var gMail = item.slice(i1+1);
    meme.find({src : "./meme-images/"+src}, (err, memes) => {
        var likedArr = memes[0]['liked'];
            var newArr1 = new Array();
            likedArr.filter((e) => {
                if(e!=gMail) {
                    newArr1.push(e);
                }
            });
            var newValues = { $set: {title : memes[0]['title'], src : memes[0]['src'], liked : newArr1, comments : memes[0]['comments']} };
            var myQuery =  { title : memes[0]['title'] };
            meme.updateOne(myQuery, newValues, (err, r) => {
                if(r)
                res.send("yes");
            });
    });
});