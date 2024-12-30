import {
  configureStore, // Configures the Redux store.
  createAsyncThunk, // Creates async actions for handling API calls and side effects.
  createSlice, // Creates a Redux slice to manage state and reducers.
} from "@reduxjs/toolkit";
import { API_KEY, API_TOKEN } from "../utils/constants"; // Constants for authenticating requests to the TMDB API.
import axios from "axios"; // HTTP client for making API requests.

const backendURL = process.env.REACT_APP_BACKEND_URL;

const initialState = {
  movies: [], // To store full movie details
  moviesGenres: [],
  movieGenresLoaded: false,
  tvShows: [],
  tvShowsGenres: [],
  tvShowsGenresLoaded: false,
  likedMedia: [], // Media items the user has liked
  likedMovies: [], // To store liked movie IDs fetched from the backend
  likedTvShows: [], // To store liked tv show IDs fetched from the backend
  wantToWatch: [], // To store movie and tv shows IDs that users want to watch fetched from the backend
};

// Fetches genres for movies from TMDB API.
export const getGenresForMovies = createAsyncThunk(
  "netflix/movieGenres",
  async () => {
    const {
      // Extracts the genres property and returns it as the action payload.
      data: { genres },
      // Uses axios to make the request and logs the response data.
    } = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
    );
    console.log("movie genres", genres);
    return genres;
  }
);

// Fetches genres for tvShows from TMDB API.
export const getGenresForTvShows = createAsyncThunk(
  "netflix/tvShowsGenres",
  async () => {
    const {
      data: { genres },
    } = await axios.get(
      `https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}`
    );

    console.log("tv shows genres", genres);
    return genres;
  }
);

// Fetches movies by a specific genre.
export const getMoviesByGenres = createAsyncThunk(
  "netflix/getMoviesByGenres",
  async (genre) => {
    const getMoviesByGenresOptions = {
      method: "GET",
      url: `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=original_title.asc&with_genres=${genre}`,
      headers: {
        accept: "application/json",
        Authorization: `${API_TOKEN}`,
      },
    };

    axios
      .request(getMoviesByGenresOptions)
      .then(function (response) {
        console.log(`getMovieByGenresOptions`);
        console.log(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }
);

// Fetches tvShows by a specific genre.
export const getTvShowsByGenres = createAsyncThunk(
  "netflix/getTvShowsByGenres",
  async (genre) => {
    const getTvShowsByGenresOptions = {
      method: "GET",
      url: `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_video=false&language=en-US&page=1&sort_by=original_title.asc&with_genres=${genre}`,
      headers: {
        accept: "application/json",
        Authorization: `${API_TOKEN}`,
      },
    };

    axios
      .request(getTvShowsByGenresOptions)
      .then(function (response) {
        console.log(`getTvShowsByGenresOptions`);
        console.log(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }
);

// Fetches movies
export const getMovies = createAsyncThunk("netflix/movies", async () => {
  const fetchMoviesForPage = async (page) => {
    const options = {
      method: "GET",
      url: `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&region=UK&sort_by=popularity.desc`,
      headers: {
        accept: "application/json",
        Authorization: `${API_TOKEN}`,
      },
    };

    const response = await axios.request(options);
    return response.data.results;
  };

  // Fetches paginated movie data in parallel using Promise.all.
  // Fetch pages 1, 2, and 3 in parallel
  const moviePages = await Promise.all([
    fetchMoviesForPage(1),
    fetchMoviesForPage(2),
    fetchMoviesForPage(3),
    fetchMoviesForPage(4),
  ]);

  // Combine all results into a single array
  const allMovies = [].concat(...moviePages);

  return allMovies;
});

// Fetch tv shows
export const getTvShows = createAsyncThunk("netflix/tvShows", async () => {
  const fetchTvShowsForPage = async (page) => {
    const options = {
      method: "GET",
      url: `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${page}&sort_by=popularity.desc&watch_region=UK&with_origin_country=US`,
      headers: {
        accept: "application/json",
        Authorization: `${API_TOKEN}`,
      },
    };

    const response = await axios.request(options);
    return response.data.results;
  };

  // Fetch pages 1, 2, and 3 in parallel
  const tvShowPages = await Promise.all([
    fetchTvShowsForPage(1),
    fetchTvShowsForPage(2),
    fetchTvShowsForPage(3),
    fetchTvShowsForPage(4),
  ]);

  // Combine all results into a single array
  const allTvShows = [].concat(...tvShowPages);

  return allTvShows;
});

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\\

// Firsy fetches liked media details from the backend, then retrieves full details from TMDB.
export const getUserLikedMedia = createAsyncThunk(
  "netflix/getLiked",
  async (email) => {
    const { data } = await axios.get(`${backendURL}api/user/liked/${email}`);

    // Ensure that the data from the response contains the correct media array
    const allMedia = data.media; // Array of [movieId, mediaType]

    // Fetch movie/TV show details from TMDB for each item based on mediaType
    const mediaDetails = await Promise.all(
      allMedia.map(async ([mediaId, mediaType]) => {
        console.log(`movieId: ${mediaId}, mediaType: ${mediaType}`);

        // Check if movieId or mediaType is valid
        if (!mediaId || (mediaType !== "movie" && mediaType !== "tv")) {
          console.warn("Invalid movieId or mediaType", { mediaId, mediaType });
          return null; // Skip this invalid item
        }

        try {
          const mediaDetails = await axios.get(
            `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${API_KEY}`
          );

          return {
            mediaId: mediaId,
            mediaType: mediaType,
            mediaDetails: mediaDetails.data,
          };
        } catch (error) {
          console.error(
            `Error fetching details for ${mediaType} with ID: ${mediaId}`,
            error
          );
          return null; // Handle errors
        }
      })
    );

    // Filter out any null values (in case of errors)
    return mediaDetails.filter((detail) => detail !== null);
  }
);

// Redux Thunk: Fetching Shared Media Details
// Fetches shared media details grouped by user.
export const getUserSharedMedia = createAsyncThunk(
  "netflix/shared",
  async (email) => {
    const { data } = await axios.get(`${backendURL}api/user/shared/${email}`);

    const allMedia = data.media;

    console.log("Fetched media from backend:", allMedia);

    // Ensure we are receiving an array of media items with expected properties
    if (!Array.isArray(allMedia) || allMedia.length === 0) {
      console.warn("No valid media data received");
      return [];
    }

    let mediaDetailsGroupedByUser = [];

    await Promise.all(
      allMedia.map(async (item) => {
        const { media, username } = item || {};

        // Find or initialize user object
        let user = mediaDetailsGroupedByUser.find(
          (u) => u.username === username
        );
        if (!user) {
          user = { username, media: [] };
          mediaDetailsGroupedByUser.push(user);
        }

        // Process each media item
        await Promise.all(
          media.map(async ({ mediaId, mediaType, markedBy }) => {
            if (!mediaId || !mediaType) return;

            try {
              const response = await axios.get(
                `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${API_KEY}`
              );

              user.media.push({
                mediaId,
                mediaType,
                markedBy,
                mediaDetails: response.data,
              });
            } catch (error) {
              console.error(
                `Error fetching details for mediaId: ${mediaId}`,
                error
              );
            }
          })
        );
      })
    );

    return mediaDetailsGroupedByUser;
  }
);

// Sends a request to remove media from the user's liked list and updates the Redux state.
export const removeFromLikedMedia = createAsyncThunk(
  "/netflix/deleteLiked",
  async ({ email, mediaId }) => {
    const {
      data: { media },
    } = await axios.put(`${backendURL}api/user/remove`, {
      email,
      mediaId,
    });
    console.log(media);
    return media;
  }
);

// Sends a request to remove media from the shared list and fetches updated details.
export const removeFromSharedMedia = createAsyncThunk(
  "/netflix/deleteShared",
  async ({ email, mediaId }, { dispatch }) => {
    // Step 1: Send removal request to backend
    const response = await axios.put(
      `${backendURL}api/user/removeFromWantToWatch`,
      { email, mediaId }
    );

    // Basic updated wantToWatch list returned from backend
    const updatedWantToWatch = response.data.wantToWatch;
    // console.log("Updated wantToWatch list from backend:", updatedWantToWatch);

    // Step 2: Fetch full media details for each item in updated wantToWatch
    const enrichedMedia = await Promise.all(
      updatedWantToWatch.media.map(async (media) => {
        const { mediaId, mediaType, markedBy } = media;
        try {
          const mediaResponse = await axios.get(
            `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${API_KEY}`
          );
          return {
            mediaId,
            mediaType,
            markedBy,
            mediaDetails: mediaResponse.data,
          };
        } catch (error) {
          console.error(
            `Error fetching details for mediaId: ${mediaId}`,
            error
          );
          return null; // Skip if there's an error
        }
      })
    );

    // Filter out any null values if errors occurred
    const enrichedWantToWatch = {
      username: updatedWantToWatch.username,
      media: enrichedMedia.filter(Boolean),
    };

    return enrichedWantToWatch; // Return enriched wantToWatch to the reducer
  }
);

// Defines a slice with async reducers for handling state updates based on thunk results.
const NetflixSlice = createSlice({
  name: "Netflix",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(getGenresForMovies.fulfilled, (state, action) => {
      state.movieGenres = action.payload;
      state.movieGenresLoaded = true;
    });
    builder.addCase(getGenresForTvShows.fulfilled, (state, action) => {
      state.tvShowsGenres = action.payload;
      state.tvShowsGenresLoaded = true;
    });
    builder.addCase(getMovies.fulfilled, (state, action) => {
      console.log("Movies from API:", action.payload);
      state.movies = action.payload;
    });
    builder.addCase(getTvShows.fulfilled, (state, action) => {
      console.log("Tv Shows from API:", action.payload);
      state.tvShows = action.payload;
    });
    builder.addCase(getMoviesByGenres.fulfilled, (state, action) => {
      state.moviesByGenres = action.payload;
    });
    builder.addCase(getTvShowsByGenres.fulfilled, (state, action) => {
      state.tvShowsByGenres = action.payload;
    });
    builder.addCase(getUserLikedMedia.fulfilled, (state, action) => {
      state.likedMedia = action.payload;
    });
    builder.addCase(removeFromLikedMedia.fulfilled, (state, action) => {
      state.likedMedia = state.likedMedia.filter((media) => {
        return media.mediaId !== action.meta.arg.movieId;
      });
    });
    builder.addCase(getUserSharedMedia.fulfilled, (state, action) => {
      state.wantToWatch = action.payload;
    });
    builder.addCase(removeFromSharedMedia.fulfilled, (state, action) => {
      const updatedWantToWatch = action.payload;
      const userIndex = state.wantToWatch.findIndex(
        (user) => user.username === updatedWantToWatch.username
      );

      if (userIndex > -1) {
        state.wantToWatch[userIndex] = updatedWantToWatch; // Replace the user's data
      } else {
        state.wantToWatch.push(updatedWantToWatch); // Add new if user data not found
      }
    });
  },
});

// Configures the Redux store with the NetflixSlice.
export const store = configureStore({
  reducer: {
    netflix: NetflixSlice.reducer,
  },
});
