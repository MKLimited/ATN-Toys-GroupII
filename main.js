// Import libraries
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to the database!"));

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
session({
    secret: "my secret key",
    saveUninitialized: true,
    resave:false,
})
);

app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});


// set template engine
app.set("view engine","ejs");
// upload image
app.use(express.static("uploads"));

// // Define a simple route
// app.get("/", (req, res) => {
//     res.send("hello meo meo Minh Thanh");
// });

// route prefix
    app.use("",require("./routes/routes"));


// Start the server
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});