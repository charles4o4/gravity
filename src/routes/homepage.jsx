import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();

  const handleHowToPlayBtn = () => {
    window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  };

  const handlePlayBtn = () => {
    navigate("/upload");
  };

  return (
    <>
      <div className="homepage-background">
        <div className="homepage-main">
          <div className="homepage-header">
            <h1 id="gravity-h1">GRAVITY</h1>
            <p id="gravity-p">Learning New Words Made Easier and More Fun!</p>
          </div>
        </div>
        <div className="homepage-footer">
          {/* How to play button will send the user to an youtube video. */}
          <button
            className="homepage-button"
            id="homepage-howbtn"
            onClick={handleHowToPlayBtn}
          >
            HOW TO PLAY
          </button>
          <button
            className="homepage-button"
            id="homepage-startbtn"
            onClick={handlePlayBtn}
          >
            START PLAYING
          </button>
        </div>
      </div>
    </>
  );
};

export default Homepage;
