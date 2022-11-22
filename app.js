const express = require("express");
const app = express();
const PORT = 5000;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require('cors')
const path = require('path');
const bodyParser = require('body-parser');

//import routes
const AuthRoutes = require("./routes/AuthRoutes");
const FaqRoutes = require("./routes/FaqRoutes");
const FileRoutes = require("./routes/FileRoutes");

dotenv.config();

mongoose.connect("mongodb+srv://admin:admin@cluster0.kiw6oej.mongodb.net/admindb?retryWrites=true&w=majority");

app.use(express.json());

var originsWhitelist = [
    '*',
    'http://localhost:4200'
];
var corsOptions = {
    origin: function (origin, callback) {
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        // callback(null, isWhitelisted);
        callback(null, true);
    },
    credentials: true
}
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//route middlewares
app.use("/api/auth", AuthRoutes);
app.use("/api/faq", FaqRoutes);
// app.use("/api/file", FileRoutes);
app.use(express.static(path.join(__dirname, 'FAQ')));


app.listen(PORT, () => console.log(`Running server on port: ${PORT}`));