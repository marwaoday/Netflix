import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseAuth } from "../utils/firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { useSelector, useDispatch } from "react-redux";
import { getGenresForMovies, getMovies } from "../store";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import Slider from "../components/Slider";
import NotAvailable from "../components/NotAvailable";
import SelectGenre from "../components/SelectGenre";

export default function Movies() {
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate(); // React Router hook used for programmatic navigation.
  const dispatch = useDispatch(); // Provides the dispatch function to trigger Redux actions.

  const movies = useSelector((state) => state.netflix.movies); // Retrieves the list of movies from the Redux store.
  // Retrieves the list of genres for movies from the Redux store.
  const moviesGenres = useSelector((state) => state.netflix.moviesGenres);

  useEffect(() => {
    // Dispatches the following Redux actions: Fetches available movie genres.
    dispatch(getGenresForMovies());
    // Dispatches the following Redux actions: Fetches the list of movies
    dispatch(getMovies());
  }, [dispatch]);
  console.log(movies);

  window.onscroll = () => {
    setIsScrolled(window.scrollY === 0 ? false : true);
    // Cleans up the event listener to prevent memory leaks.
    return () => (window.onscroll = null);
  };
  onAuthStateChanged(firebaseAuth, (currentUser) => {
    // If no user is authenticated, redirects to the /login
    if (!currentUser) navigate("/login");
  });
  return (
    <Container>
      <div className="nav">
        <Navbar isScrolled={isScrolled} />
      </div>

      <div className="data">
        <SelectGenre genres={moviesGenres} />
        {movies?.length ? <Slider movies={movies} /> : <NotAvailable />}
      </div>
    </Container>
  );
}

const Container = styled.div`
  .data {
    margin-top: 8rem;
    .not-available {
      text-align: center;
      color: white;
      margin-top: 4rem;
    }
  }
`;
