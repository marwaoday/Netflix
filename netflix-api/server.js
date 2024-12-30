const express = require("express"); // Express framework for building the API
const cors = require("cors"); // Middleware to enable Cross-Origin Resource Sharing
const mongoose = require("mongoose"); // MongoDB Object Data Modeling (ODM) library
const userRoutes = require("./routes/UserRoutes"); // Import user-related routes
require("dotenv").config(); // Load environment variables from .env file

// Initialize the Express application
const app = express();

// Add a test path, to test when deploying backend to production first
app.get("/test", (req, res) => {
  res.send("Public route is working!");
});

// Set allowed origin for CORS
// Use CORS middleware with configuration
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // If you need cookies or authentication headers
  })
);
app.use(express.json()); // Enable parsing of JSON bodies in incoming requests that contain JSON data.

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined.");
  process.exit(1); // Exit if MONGODB_URI is missing
}

// Connect to MongoDB using Mongoose
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connected Successfully"))
  .catch((err) => {
    console.error("Error connecting to DB:", err.message);
  });

// Use user routes
app.use("/api/user", userRoutes);
// Mount the user routes at the `/api/user` path.
// Example: A POST request to `/api/user/add` will be handled by the corresponding route in `UserRoutes.js`

// Set the port for the server to listen on
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server started on port ${PORT}`));
// Log a message indicating the server is running and listening on the actual specified port

module.exports = app;
