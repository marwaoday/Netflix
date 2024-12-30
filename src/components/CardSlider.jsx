import React, { useState, useRef } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import styled from "styled-components";
import Card from "./Card";

export default React.memo(function CardSlider({
  title,
  data,
  currentUsername,
  isLiked,
  isFamilyView,
}) {
  const [showControls, setShowControls] = useState(false); // Tracks whether the slider controls (left/right arrows) are visible.
  const [sliderPosition, setSliderPosition] = useState(0);
  const listRef = useRef(); // A reference to the slider container for manipulating its position
  // console.log("CardSlider data prop updated:", data);

  const handleDirection = (direction) => {
    let distance = listRef.current.getBoundingClientRect().x - 100;
    // Calculates the current X position of the slider relative to its container.

    // Moves the slider to the left:
    // If at position 1, it resets the slider to the start.
    // Otherwise, it moves the slider by adjusting the transform CSS property.
    // Decreases sliderPosition by 1, (numbers of controls 0 to 3)/
    if (direction === "left" && sliderPosition > 0) {
      if (sliderPosition === 1) {
        listRef.current.style.transform = `translateX(0px)`; // Reset to the start
      } else {
        listRef.current.style.transform = `translateX(${200 + distance}px)`;
      }
      setSliderPosition(sliderPosition - 1);
    }
    // Moves the slider to the right:
    // Moves the slider by decreasing the X position (translateX CSS property).
    // Increases sliderPosition by 1.
    // Prevents moving right beyond position 3.
    if (direction === "right" && sliderPosition < 3) {
      listRef.current.style.transform = `translateX(${-200 + distance}px)`;
      setSliderPosition(sliderPosition + 1);
    }
  };

  return (
    <Container
      className="flex column"
      // Toggles visibility of slider controls when the mouse enters or leaves the component.
      onMouseEnter={() => {
        setShowControls(true);
      }}
      onMouseLeave={() => {
        setShowControls(false);
      }}
    >
      <h1 className="title">{title}</h1>
      <div className="wrapper">
        {/* Left arrow control (AiOutlineLeft): */}
        {/* Only visible when showControls is true. Moves the slider left when clicked.*/}
        <div
          className={`slider-action left ${
            !showControls ? "none" : ""
          } flex j-center a-center`}
        >
          <AiOutlineLeft onClick={() => handleDirection("left")} />
        </div>
        {/* A flexbox container for all cards. Its position is manipulated using listRef. */}
        <div className="flex slider" ref={listRef}>
          {data?.map((item, index) => {
            const posterPath =
              item.poster_path ||
              item.backdrop_path ||
              item.mediaDetails.poster_path ||
              item.mediaDetails.backdrop_path;

            const title =
              item.title ||
              item.name ||
              item.mediaDetails.title ||
              item.mediaDetails.name;

            if (!posterPath || !title) {
              console.log(`Item at index ${index} is missing data:`, item);
              return null;
            }
            return (
              <Card
                title={title}
                posterPath={posterPath}
                key={item.mediaId || item.id || index}
                data={item}
                currentUsername={currentUsername}
                isLiked={isLiked}
                isFamilyView={isFamilyView}
              />
            );
          })}
        </div>

        {/* Right arrow control (AiOutlineRight): */}
        {/* Visible only when showControls is true. Moves the slider right when clicked.*/}
        <div
          className={`slider-action right ${
            !showControls ? "none" : ""
          } flex j-center a-center`}
        >
          <AiOutlineRight onClick={() => handleDirection("right")} />
        </div>
      </div>
    </Container>
  );
});

const Container = styled.div`
  gap: 1rem;
  position: relative;
  padding: 2rem 0;
  h1 {
    margin-left: 50px;
  }
  .wrapper {
    .slider {
      width: max-content;
      gap: 1rem;
      transform: translateX(00px);
      transition: 0.3s ease-in-out;
      margin-left: 50px;
    }
    .slider-action {
      position: absolute;
      z-index: 99;
      height: 100%;
      top: 0;
      bottom: 0;
      width: 50px;
      transition: 0.3s ease-in-out;
      svg {
        font-size: 2rem;
      }
    }
    .none {
      display: none;
    }
    .left {
      left: 0;
    }
    .right {
      right: 0;
    }
  }
`;
