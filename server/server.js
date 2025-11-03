const express = require("express");
const app = express();
const mongoose = require('mongoose')
const cors = require("cors");

const uri = "mongodb+srv://dbUserKahmin:appdomainKSU@sweetledgercluster.jl1drsf.mongodb.net/sweetledgerdb?retryWrites=true&w=majority";

let user = null;
const corsOptions = {
    origin: ["http://localhost:5173"]
};

app.use(cors(corsOptions));

app.get("/api", (req, res) => {


    res.json({"fruits": ["Apples", "Orange", "Banana", "Ryoiki Tenkai"]});

    });

mongoose.connect(uri)
.then(() => {
    console.log("Connected to Database!");
    app.listen(8080, () => {
        console.log("Server is runnning on port 8080")
    })
})