const express = require("express");
const app = express();
const PORT = 5000;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require('cors')

//import routes
const AuthRoutes = require("./routes/AuthRoutes");
const FaqRoutes = require("./routes/FaqRoutes");

dotenv.config();

mongoose.connect("mongodb+srv://admin:admin@cluster0.kiw6oej.mongodb.net/admindb?retryWrites=true&w=majority");

// //connect to db
// mongoose.connect(
//     process.env.DB_CONNECTION_STRING, {
//         useUnifiedTopology: true,
//         useNewUrlParser: true
//     },
//     () => console.log("Connected to DB")
// );

app.use(express.json());

var originsWhitelist = [
    'http://localhost:4200',      
    //  'http://www.myproductionurl.com'
];
var corsOptions = {
    origin: function (origin, callback) {
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials: true
}
app.use(cors(corsOptions));


//route middlewares
app.use("/api/auth", AuthRoutes);
app.use("/api/faq", FaqRoutes);

app.listen(PORT, '192.168.0.26', () => console.log(`Running server on port: ${PORT}`));