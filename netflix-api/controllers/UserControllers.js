const User = require("../models/UserModels"); // Import the User model to interact with the database.

// Add a media item to the user's liked list.
module.exports.addToLikedMedia = async (req, res) => {
  try {
    const { email, mediaId, mediaType } = req.body; // Take the email, mediaId, and mediaType from the request body.
    const user = await User.findOne({ email }); // Use the email to find the user in the database.
    if (user) {
      // Check if the user exists.
      const mediaAlreadyLiked = user.likedMedia.find(
        (item) => item.mediaId === mediaId // Then check if the media is already in the liked list.
      );
      if (!mediaAlreadyLiked) {
        // If the media is not already liked:
        user.likedMedia.push({ mediaId, mediaType }); // Add the media to the liked list.
        await user.save(); // Save the updated user to the database.
        return res.json({ msg: "Movie added successfully!" }); // Confirm with success message.
      } else {
        return res.json({ msg: "Movie is already in the liked list!" }); // If media item is already liked, send a message.
      }
    } else {
      // If the user does not exist, create a new user with the liked media.
      await User.create({ email, likedMedia: [{ mediaId, mediaType }] });
      return res.json({ msg: "Movie added and user created successfully!" });
    }
  } catch (error) {
    console.error("Error adding movie:", error); // Log the full error for debugging.
    return res
      .status(500) // Respond with status 500 for server error.
      .json({ msg: "Error adding movie", error: error.message }); // Also send an error message.
  }
};

// Fetch all liked media for a specific user.
module.exports.getUserLikedMedia = async (req, res) => {
  try {
    const { email } = req.params; // Extract email from the request parameters.
    const user = await User.findOne({ email }); // Find the user by email in the database.

    if (user) {
      // If the user exists:
      return res.json({
        msg: "Liked media fetched successfully", // Send a success message.
        media: user.likedMedia.map((item) => [item.mediaId, item.mediaType]), // Return the media list.
      });
    } else {
      return res.status(404).json({ msg: "User with given email not found" }); // If user does not exist, respond with 404
    }
  } catch (error) {
    return res
      .status(500) // If error respond with status 500 for server error.
      .json({ msg: "Error fetching liked media", error: error.message }); // Send error message.
  }
};

// Remove a media item from the user's liked list.
module.exports.removeFromLikedMedia = async (req, res) => {
  try {
    const { email, movieId } = req.body; // Extract email and movieId from the request body.
    const user = await User.findOne({ email }); // Find the user by email in the mongodb database.

    if (!user) return res.status(404).json({ msg: "User not found" }); // If user not found, respond with 404.

    const mediaIndex = user.likedMedia.findIndex(
      (media) => media.movieId === movieId // Adjust to find the index of the media item to be removed.
    );

    if (mediaIndex === -1) {
      return res.status(400).json({ msg: "Media not found in liked list" }); // If media not found, respond with 400 Bad Request
    }

    user.likedMedia.splice(mediaIndex, 1); // Remove the media from the liked list.
    await user.save(); // Save the updated user to the database.

    return res.json({
      msg: "Media removed successfully",
      media: user.likedMedia, // Return updated liked media list.
    });
  } catch (error) {
    return res
      .status(500) // Respond with status 500 Internal Server Error for server error.
      .json({ msg: "Error removing media", error: error.message });
  }
};

// Add a media item to the family's shared want-to-watch list.
// Family Shared Media That User Wants To Watch
module.exports.addToFamilyWantToWatch = async (req, res) => {
  try {
    const { email, mediaId, mediaType } = req.body; // Extract email, mediaId, and mediaType from the request body.
    const user = await User.findOne({ email }); // Find the user by email in the database.
    const username = user.username; // Extract the username of the user.

    if (user) {
      // Check if the user exists.
      const mediaAlreadyShared = user.wantToWatch.find(
        (item) => item.mediaId === mediaId // Check if the media is already in the shared list.
      );
      if (!mediaAlreadyShared) {
        // If the media is not already shared:
        user.wantToWatch.push({ mediaId, mediaType, markedBy: username }); // Add the media to the shared list.
        await user.save(); // Save the updated user to the database.
        return res.json({ msg: "Media added successfully!" }); // Respond with success message.
      } else {
        return res.json({ msg: "Media is already in the shared list!" }); // If media already shared, send a message.
      }
    } else {
      // If the user does not exist, create a new user with the shared media.
      await User.create({
        email,
        wantToWatch: [{ mediaId, mediaType, username }], // both tv and movies are saved as one mediaType
      });
      return res.json({ msg: "Media added and user created successfully!" });
    }
  } catch (error) {
    console.error("Error adding media for family shared list", error); // Log full error for debugging if need be.
    return res.status(500).json({
      msg: "Error adding media for family shared list", //  Share error message.
      error: error.message, // Include error details for debugging
    });
  }
};

// Fetch all family-shared want-to-watch media for all users.
module.exports.getUserSharedMedia = async (req, res) => {
  try {
    const users = await User.find({}, "username wantToWatch"); // Fetch all users and their shared media.

    const response = users.map((user) => ({
      username: user.username, // Include the username.
      media: user.wantToWatch.map((item) => ({
        mediaId: item.mediaId,
        mediaType: item.mediaType,
        markedBy: item.markedBy, // Who marked the media.
      })),
    }));

    return res.json({
      msg: "Want-to-watch media fetched successfully",
      media: response, // Return the formatted response.
    });
  } catch (error) {
    return res
      .status(500) // Respond with status 500 Internal Serfver for server error.
      .json({ msg: "Error fetching media", error: error.message });
  }
};

// Remove a media item from the family's shared want-to-watch list.
module.exports.removeFromWantToWatch = async (req, res) => {
  try {
    const { email, mediaId } = req.body; // Extract email and mediaId from the request body.

    const user = await User.findOne({ email }); // Find the user by email in the database.
    if (!user) return res.status(404).json({ msg: "User not found" }); // If user not found, respond with 404 Page Not Found

    // Filter out the media item by the ID
    user.wantToWatch = user.wantToWatch.filter(
      (media) => media.mediaId !== mediaId // Remove the matching media.
    );
    await user.save(); // Save the updated user to the database.

    // Return only basic media data and username without mediaDetails
    return res.json({
      msg: "Media removed successfully from wantToWatch list",
      wantToWatch: {
        username: user.username, // Include username.
        media: user.wantToWatch, // Return array of updated media without details
      },
    });
  } catch (error) {
    console.error("Error in removeFromWantToWatch:", error);
    return res
      .status(500) // Respond with status 500 Internal Server for server error.
      .json({ msg: "Error removing media", error: error.message });
  }
};

// Create a new user with a username.
module.exports.createUser = async (req, res) => {
  let { email, username } = req.body; // Extract email and username from the request body to create new user.

  // Check if email and username are provided
  if (!email || !username) {
    return res.status(400).json({ msg: "Email and username are required" }); // Respond with 400 Bad Request if missing.
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      // Check if the user already exists.
      return res
        .status(400) // Respond with 400 Bad Request if missing again.
        .json({ msg: "User already exists with this email" });
    }

    // Create a new user instance
    const newUser = new User({ email, username });

    // Save the user to the database
    await newUser.save();

    // Send a response back
    res.status(201).json({ msg: "User created successfully", user: newUser }); //  Send a 201 created status code, the request was fulfilled and a new resource was created.
  } catch (error) {
    // Error handling, 500 Internal Server Error
    res.status(500).json({ msg: "Error creating user", error: error.message });
  }
};
