const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const auth_users = require("./router/auth_users.js");

const app = express();

app.use(express.json());

app.use(session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));


app.use("/auth", auth_users.authenticated);

app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session && req.session.user) {
        next(); // User is authenticated, proceed to the next route
    } else {
        res.status(401).json({ message: "Unauthorized access. Please log in." });
    }
});

 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
