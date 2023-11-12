const express = require('express');
const app = express();
const PORT = process.env.port || 5000;
const cors = require('cors');
const mongoose = require('mongoose');
const { mongoUrl } = require("./keys");
const path = require('path')

app.use(cors())
require('./models/models')
require('./models/post')

app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/createPost'))
app.use(require('./routes/user'))
mongoose.connect(mongoUrl);

mongoose.connection.on("connected", () => {
    console.log("Successfully Connected to Mongodb");
})

mongoose.connection.on("error", () => {
    console.log("Not Connected to mongodb");
})


//  serving the frontend
app.use(express.static(path.join(__dirname, "./frontend/build")))
app.get("*", (req, res) => {
    res.sendFile(
        path.join(__dirname, "./frontend/build/index.html"),
        function (err) {
            res.status(500).send(err)
        }
    )
})
app.listen(PORT, () => {
    console.log("Server is Running on Port no " + PORT);
})