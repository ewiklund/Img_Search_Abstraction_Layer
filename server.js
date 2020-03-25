// Get requirements and instantiate some of them.

const express     = require("express");
const app = express();
const bodyParser  = require("body-parser");
const cors        = require("cors");
const mongoose = require("mongoose");
const Bing = require("node-bing-api")({accKey: '853fb01d96b34ecea01e3b1dde9b76a2'});
const searchTerm = require("./models/searchTerm");
const dotenv = require("dotenv").config();

app.use(bodyParser.json());
app.use(cors());
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true });

app.get("/api/recentsearchs", (req, res, next)=> {
    searchTerm.find({}, (err, data)=> {
      res.json(data);
    });
});
// Calling required parameters to do a search for an Image
app.get("/api/imagesearch/:searchVal*", (req, res, next)=> {
  let { searchVal } = req.params;
  let { offset } = req.query;

  let data = new searchTerm({
      searchVal,
      searchDate: new Date()
  });

  data.save(err => {
    if(err) {
      res.send("Error saving to database");
    }
  });

  let searchOffset;
  // Does offset exist
  if(offset) {
    if(offset==1) {
      offset=0;
      searchOffset = 1;
    }
    else if(offset>1) {
      searchOffset = offset +1;
    }
  }

Bing.images(searchVal, {
    top: (10 * searchOffset),
    skip: (10 * offset)
}, function(error, res, body) {

let bingData = [];
for(let i=0; i<10; i++) {
  bingData.push({
    url: body.value[i].webSearchUrl,
    snippet: body.value[i].name,
    thumbnail: body.value[i].thumbnailUrl,
    context: body.value[i].hostPageDisplayUrl
  });
}
res.json(bingData);
});

});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running");
});
