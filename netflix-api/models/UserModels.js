const mongoose = require("mongoose"); // Import the mongoose library to middle man for MongoDB.

// Define the schema for the users collection.
const usersSchema = new mongoose.Schema({
  // Define the user's email field.
  email: {
    type: String, // This field is required.
    required: true,
    unique: true, // Each email must be unique in the database.
  },
  // Define the user's username field.
  username: {
    type: String, // The username is a string.
    required: true,
    unique: true, // Each username must be unique in the database.
  },
  // Define the likedMedia array to store the user's liked media.
  likedMedia: [
    {
      mediaId: {
        type: Number, // Unique identifier for the media (e.g., movie/ttv show ID from api).
        required: true,
      },
      mediaType: { type: String }, // Type of media (e.g., "movie" or "tv").
      addedAt: { type: Date, default: Date.now },
    },
  ],
  // Define the wantToWatch array to store media shared with family or friends.

  wantToWatch: [
    {
      mediaId: { type: Number, required: true },
      mediaType: { type: String, required: true },
      markedBy: { type: String, required: true }, // Username of the user who marked it
      addedAt: { type: Date, default: Date.now },
    },
  ],
});

// Export the schema as a Mongoose model named "users".
module.exports = mongoose.model("users", usersSchema);
// Allows the schema to be used to wing-woman interact with the "users" collection in the database.
