// server.js
// Import necessary modules
const express = require('express'); // Express.js for creating the server
const path = require('path');     // Path module for handling file paths
const fs = require('fs');         // File system module for file operations
const bodyParser = require('body-parser'); // Body-parser to handle request bodies

// Initialize the express application
const app = express();

// --- Middleware ---

// Serve static files from the 'public' directory
// This makes files in the 'public' folder accessible from the web
app.use(express.static(path.join(__dirname, 'public')));

// Use body-parser middleware to parse URL-encoded and JSON request bodies
// This is needed to access data sent in POST requests from forms
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json

// --- Data Storage ---
const usersFilePath = path.join(__dirname, 'users.json'); // Path to the users.json file

// Helper function to read user data from users.json
function getUsers() {
    try {
        const usersData = fs.readFileSync(usersFilePath, 'utf8'); // Try to read the file
        return JSON.parse(usersData); // Parse the JSON string into a JavaScript object (array)
    } catch (error) {
        // If the file doesn't exist or there's an error, return an empty array
        return [];
    }
}

// Helper function to write user data to users.json
function saveUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2)); // Write the users array back to users.json as a formatted JSON string
}

// --- Signup Endpoint ---
app.post('/signup', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        return res.status(400).send('Email and password are required.'); // Respond with an error if email or password is missing
    }

    const users = getUsers(); // Get the current users from users.json

    // Check if the email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(409).send('Email already exists. Please use a different email or login.'); // Respond with an error if email is already registered
    }

    // Create a new user object
    const newUser = {
        email: email,
        password: password, // In a real application, you should hash the password!
        timestamp: new Date().toISOString() // Add a timestamp for when the user signed up
    };

    users.push(newUser); // Add the new user to the users array
    saveUsers(users);     // Save the updated users array back to users.json

    console.log(`New user signed up: ${email}`); // Log signup activity on the server side
    res.send('Signup successful!'); // Respond to the client with a success message
});

// --- Login Endpoint ---
app.post('/login', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        return res.status(400).send('Email and password are required.'); // Respond with an error if email or password is missing
    }

    const users = getUsers(); // Get the current users from users.json

    // Find the user by email
    const user = users.find(user => user.email === email);

    if (!user) {
        return res.status(401).send('Invalid credentials. User not found.'); // Respond with an error if the email is not found
    }

    // Check if the password matches
    // In a real application, you should compare hashed passwords!
    if (user.password !== password) {
        return res.status(401).send('Invalid credentials. Password incorrect.'); // Respond with an error if the password doesn't match
    }

    console.log(`User logged in: ${email}`); // Log login activity on the server side
    res.send('Login successful!'); // Respond to the client with a success message
});

// --- Start the server ---
const PORT = 3000; // Define the port number for the server to listen on

app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`); // Start the server and log a message to the console
});
