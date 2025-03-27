const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
const cors = require("cors");
public_users.use(cors());

//let users = [];
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
    return res.json(JSON.stringify(books, null, 2)); 
});

const getAllBooks = async () => {
    try {
        const response = await axios.get("https://purushotta23-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/");
        return response.data;
    } catch (error) {
        console.error("Error fetching books:", error.message);
        throw error;
    }
};


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.json(books[isbn]); // Send the book details as JSON
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

const getBookByISBN = async (isbn) => {
    try {
        const response = await axios.get(`https://purushotta23-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/isbn/${isbn}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching book details:", error.message);
        throw error;
    }
};

  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let booksByAuthor = [];

    for (let key in books) {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
            booksByAuthor.push(books[key]); // Add matching books to the array
        }
    }

    if (booksByAuthor.length > 0) {
        return res.json(booksByAuthor); // Send all books by the author
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

const getBooksByAuthor = async (author) => {
    try {
        const response = await axios.get(`https://purushotta23-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/author/${author}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching books by author:", error.message);
        throw error;
    }
};


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    let title = req.params.title;
    let matchingBooks = Object.values(books).filter(book => book.title === title);

    if (matchingBooks.length > 0) {
        res.json(matchingBooks);
    } else {
        res.status(404).json({ message: "No books found with this title" });
    }
});




//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    let isbn = req.params.isbn;
    
    if (books[isbn]) {
        res.json(books[isbn].reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});


module.exports.general = public_users;
