import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseAuth } from "../utils/firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { useSelector, useDispatch } from "react-redux";
import { getUserSharedMedia } from "../store";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import CardSlider from "../components/CardSlider";

export default React.memo(function Family() {
  // Prevent unnecessary re-renders if props or state don't change.

  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState(undefined);
  const [currentUsername, setCurrentUsername] = useState(null);

  const navigate = useNavigate(); // Allows programmatic navigation between routes.
  const dispatch = useDispatch(); // Provides the dispatch function to trigger Redux actions.

  const sharedMedia = useSelector((state) => state.netflix.wantToWatch);
  // Retrieves the wantToWatch state from Redux, representing the family's shared media list.

  // console.log("sharedMedia in Family:", sharedMedia);

  // Triggers the getUserSharedMedia Redux action to fetch shared media for the logged-in user's email.
  useEffect(() => {
    if (email) {
      dispatch(getUserSharedMedia(email));
    }
  }, [dispatch, email]);

  // Monitors authentication state using Firebase's onAuthStateChanged:
  // If a user is authenticated, set their email and currentUsername.
  // If not authenticated, redirects to the /login page.
  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (currentUser) => {
      if (currentUser) {
        setEmail(currentUser.email);
        setCurrentUsername(currentUser.displayName);
      } else {
        navigate("/login");
      }
    });
  }, [navigate]);

  // useEffect(() => {
  //   console.log("Family component re-rendered with sharedMedia:", sharedMedia);
  // }, [sharedMedia]);

  //Add a global scroll event listener
  window.onscroll = () => {
    // Updates isScrolled to true if the user scrolls, otherwise false.
    setIsScrolled(window.scrollY === 0 ? false : true);
    // Ensures the listener is removed on cleanup to prevent memory leaks.
    return () => (window.onscroll = null);
  };

  return (
    <Container>
      <div className="nav">
        <Navbar isScrolled={isScrolled} />
      </div>
      <div className="content column flex">
        <h1>Let's see what the family want to watch...</h1>
        {sharedMedia && sharedMedia.length > 0 ? (
          sharedMedia.every((user) => user.media.length === 0) ? (
            <p>No shared shows available.</p>
          ) : (
            // Filter to only users with items in their "media" array
            sharedMedia
              .filter((user) => user.media && user.media.length > 0)
              .map((user, index) => (
                <div key={user.username || index} className="user-section">
                  <h2>{`${
                    user.username || "User"
                  } would like to watch these shows`}</h2>
                  <CardSlider
                    key={Date.now()}
                    data={user.media}
                    isFamilyView={true}
                    isLiked={false}
                    currentUsername={currentUsername}
                  />
                </div>
              ))
          )
        ) : (
          <p>No shared shows available.</p>
        )}
      </div>
    </Container>
  );
});

const Container = styled.div`
  .content {
    h1 {
      font-size: 3rem;
    }
    margin: 2.3rem;
    margin-top: 8rem;
    gap: 3rem;
    h2 {
      font-size: 2rem;
      padding: 0;
      margin: 0;
      margin-left: 1rem;
    }
    .grid {
      flex-wrap: wrap;
      gap: 1rem;
    }
  }
`;
