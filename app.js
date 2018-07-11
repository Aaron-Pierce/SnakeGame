const express = require('express');
const app = express();
const compression = require("compression")

app.use(express.static("./"));
app.use(compression());

app.get("/", (req, res) => {
    res.sendfile("./index.html")
})

app.listen(3000, function(){
    console.log("listening on port 3000")
})