import React, { useEffect } from "react";
import styled from "styled-components";
import { getMoviesByGenres, getTvShowsByGenres } from "../store";
import { useSelector, useDispatch } from "react-redux";

export default function SelectGenre({ genres, type }) {
  // Provides the dispatch function to trigger Redux actions.
  const dispatch = useDispatch();
  // Retrieves the genres list from the Redux store
  const selectedGenres = useSelector((state) =>
    type === "movies" ? state.netflix.moviesGenres : state.netflix.tvShowsGenres
  );

  // Checks if genres is available and not empty:
  // Then dispatches getMoviesByGenres or getTvShowsByGenres with the first genre's ID (genres[0].id) as the default selection.
  useEffect(() => {
    if (genres && genres.length > 0) {
      if (type === "movies") {
        dispatch(getMoviesByGenres(`${genres[0].id}`)); // Dispatching default genre
      } else if (type === "tvShows") {
        dispatch(getTvShowsByGenres(`${genres[0].id}`)); // Dispatching default genre
      }
    }
  }, [dispatch, genres, type]);
  // useEffect runs when the component mounts or when dispatch, genres, or type change.

  // Called when a new genre is selected from the dropdown
  const handleChange = (e) => {
    if (type === "movies") {
      dispatch(getMoviesByGenres(e.target.value));
    } else if (type === "tvShows") {
      dispatch(getTvShowsByGenres(e.target.value));
    }
  };
  // Dispatches getMoviesByGenres or getTvShowsByGenres based on the type and the selected genre's id (e.target.value).

  return (
    // If selectedGenres exists and has items:
    // Loops through the genres and renders each as an <option> with value={genre.id} and key={genre.id}.
    <Select className="flex" onChange={handleChange}>
      {selectedGenres && selectedGenres.length > 0 ? (
        selectedGenres.map((genre) => (
          <option value={genre.id} key={genre.id}>
            {/* Displays the genre name (genre.name) as the option text. */}
            {genre.name}
          </option>
        ))
      ) : (
        // If selectedGenres is empty:
        <option>No genres available</option>
      )}
    </Select>
  );
}

const Select = styled.select``;
