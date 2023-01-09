const express = require("express");
const morgan = require("morgan");
const postBank = require("./postBank");
const postList = require("./views/postList");
const postDetails = require("./views/postDetails");
const db = require('./db');

const app = express();

app.use(morgan('dev'));
app.use(express.static(__dirname + "/public"));

app.get("/", async(req, res, next) => {
  try {
    res.send(postList(await db.getPosts()));
  }
  catch(ex){
    next(ex);
  }
});

app.get("/posts/:id", async(req, res, next) => {
  try {
    res.send(postDetails(await db.getPost(req.params.id)));
  }
  catch(ex){
    next(ex);
  }
});

const PORT = 1337;

const start = async()=> {
  try {
    await db.syncAndSeed();
    app.listen(PORT, () => {
      console.log(`App listening in port ${PORT}`);
    });
  }
  catch(ex){
    console.log(ex);
  }
}

start();