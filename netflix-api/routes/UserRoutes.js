// Import specific controller functions that handle the business logic for various routes
// from the UserControllers module.
const {
  addToLikedMedia,
  getUserLikedMedia,
  removeFromLikedMedia,
  createUser,
  addToFamilyWantToWatch,
  getUserSharedMedia,
  removeFromWantToWatch,
} = require("../controllers/UserControllers");

// Create a new Express Router instance to define API endpoints.
const router = require("express").Router();

// Individual User Routes
router.post("/add", addToLikedMedia);
// POST route to add a media item to the user's liked media list.
// Calls the `addToLikedMedia` controller function.

router.get("/liked/:email", getUserLikedMedia);
// GET route to fetch the liked media for a specific user based on their email.
// Calls the `getUserLikedMedia` controller function.

router.put("/remove", removeFromLikedMedia);
// PUT route to remove a media item from the user's liked media list.
// Calls the `removeFromLikedMedia` controller function.

// Route for User Creation
router.post("/create", createUser);
// POST route to create a new user with a unique email and username.
// Calls the `createUser` controller function.

// Family Want-To-Watch Routes
router.post("/addToFamily", addToFamilyWantToWatch);
// POST route to add a media item to the family's shared "Want to Watch" list.
// Calls the `addToFamilyWantToWatch` controller function.

router.get("/shared/:email", getUserSharedMedia);
// GET route to fetch the family's shared "Want to Watch" list for a user.
// Calls the `getUserSharedMedia` controller function.

router.put("/removeFromWantToWatch", removeFromWantToWatch);
// PUT route to remove a media item from the family's shared "Want to Watch" list.
// Calls the `removeFromWantToWatch` controller function.

module.exports = router;
