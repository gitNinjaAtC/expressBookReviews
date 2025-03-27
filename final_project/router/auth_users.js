const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: "john_doe", password: "securepassword123" }
];

// Function to check if username is already registered
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Function to authenticate user
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// User login route
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.username = username; // Store username in session
        let accessToken = jwt.sign({ username: username }, "secret_key", { expiresIn: '1h' });
        return res.status(200).json({ message: "Login successful", token: accessToken });
    } else {
        return res.status(401).json({ message: "Invalid credentials" });
    }
});


// Add a book review
regd_users.put("/review/:isbn", (req, res) => {  
    const username = req.session.username;  // Ensure session is set up properly
    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const { isbn } = req.params;
    const { review } = req.query;  // Ensure review is passed in query

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    // Store the review under username
    books[isbn].reviews[username] = review;
    return res.json({ message: "Review added/updated successfully" });
});

// Delete a book review
regd_users.delete("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;

    if (!username) {
        return res.status(401).json({ message: "Unauthorized: Please log in to delete reviews." });
    }

    if (!books[isbn] || !books[isbn].reviews) {
        return res.status(404).json({ message: "Book not found or no reviews available." });
    }

    // Check if the user has posted a review
    if (!books[isbn].reviews[username]) {
        return res.status(403).json({ message: "You can only delete your own review." });
    }

    // Delete the review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
