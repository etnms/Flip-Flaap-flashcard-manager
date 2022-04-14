import axios from "axios";
import { useEffect, useState } from "react";
import "./App.scss";
import CollectionForm from "./Components/CollectionForm";
import FlashcardList from "./Components/FlashcardList";
import GettingStarted from "./Components/GettingStarted";
import Learn from "./Components/Learn";
import MenuLeft from "./Components/MenuLeft";
import Navbar from "./Components/Navbar";
import Practice from "./Components/Practice";

const App = () => {
  const token = localStorage.getItem("token");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [results, setResults] = useState([]);

  const [currentCollection, setCurrentCollection] = useState("");

  const [leftMenuChange, setLeftMenuChange] = useState(false);

  const [mode, setMode] = useState("Flashcard");

  const [username, setUsername] = useState("");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_BACKEND}/api/dashboard`, { headers: { Authorization: token! } })
      .then((res) => {
        setUsername(res.data);
        setIsLoggedIn(true);
      })
      .catch((err) => setIsLoggedIn(false));

    axios
      .get(`${process.env.REACT_APP_BACKEND}/api/collections`, { headers: { Authorization: token! } })
      .then((res) => setResults(res.data.results.collections))
      .catch((err) => {
        console.log(err);
        setResults([]);
      });
    setLoading(false);
    setLeftMenuChange(false);
  }, [token, leftMenuChange]);

  const renderMain = () => {
    if (mode === "Flashcard") return <FlashcardList currentCollection={currentCollection}></FlashcardList>;
    if (mode === "Learn") return <Learn currentCollection={currentCollection} />;
    if (mode === "Practice") return <Practice currentCollection={currentCollection} />;
  };

  return (
    <div className="App">
      {loading ? (
        <div>Loading...</div>
      ) : isLoggedIn ? (
        <div className="wrapper-content">
          <MenuLeft
            setShowCollectionForm={setShowCollectionForm}
            collectionNames={results}
            setCurrentCollection={setCurrentCollection}
            setLeftMenuChange={setLeftMenuChange}></MenuLeft>

          <div className="main-page">
            <Navbar
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              setMode={setMode}
              username={username}></Navbar>
            {showCollectionForm ? (
              <CollectionForm
                setShowCollectionForm={setShowCollectionForm}
                setLeftMenuChange={setLeftMenuChange}
              />
            ) : (
              renderMain()
            )}
          </div>
        </div>
      ) : (
        <div className="wrapper-no-auth">
          <Navbar
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            setMode={setMode}
            username={username}></Navbar>
          <GettingStarted />
        </div>
      )}
    </div>
  );
};

export default App;