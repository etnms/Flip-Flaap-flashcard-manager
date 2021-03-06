import "./Practice.scss";
import "./PracticeLearningActivity.scss";
import { useEffect, useState } from "react";
import { IFlashcard } from "../Interfaces/InterfaceFlashcard";
import {
  checkCollectionSize,
  createFakeFlashcard,
  Getdata,
  PracticeLearnActivity,
  RenderButton,
} from "./PracticeLearnActivity";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { changeExpiredStatus } from "../features/expiredSessionSlice";
import { conceptTypeText, defTypeText } from "../helper/helper";
import { Dispatch } from "redux";

const Practice = () => {
  const currentCollection = useAppSelector((state) => state.currentCollection.value);
  const currentCollectionId = useAppSelector((state) => state.currentCollection._id);
  const type = useAppSelector((state) => state.currentCollection.type);

  const [expired, setExpired] = useState<boolean>(false);

  const [results, setResults] = useState<any>([]);
  const [errorText, setErrorText] = useState<string>(""); // Error message if problems with the selected collection

  const [concept, setConcept] = useState<string>("");
  const [def, setDef] = useState<string>("");
  const [sameCard, setSameCard] = useState<boolean>(true); // Default to true
  const [checkMessage, setCheckMessage] = useState<string>("");
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [previousRdn, setPreviousRdn] = useState<number>();

  const navigate: NavigateFunction = useNavigate();
  const dispatch: Dispatch<any> = useAppDispatch();

  useEffect(() => {
    Getdata(currentCollectionId, setConcept, setErrorText, setResults, setExpired);
    if (expired === true) {
      navigate("/redirect");
      dispatch(changeExpiredStatus(true));
    }
  }, [currentCollectionId, expired, navigate, dispatch]);

  const createRandomCard = (listCollections: IFlashcard[]) => {
    if (type === "to-do")
      return setErrorText(
        "Error: This collection only contains to dos! Please use a collection with flashcards and come back."
      );
    if (concept) createFakeFlashcard(concept, def);

    setAnswerSubmitted(false);
    // Reinitialize check message & samecard for every card
    setSameCard(true);
    setCheckMessage("");

    // Define random number to show if the card is the same or not
    const rdmCard: number = Math.random();

    //Check to see if there are at least 2 items in the collection, if so display flashcards;
    if (listCollections[0] !== undefined) {
      //Create random number and loop until it's different from the previous one
      let rdn: number = 0;
      while (previousRdn === rdn) rdn = Math.floor(Math.random() * listCollections.length);
      // Set text corresponding to the randomly selected card
      setConcept(listCollections[rdn].concept);
      // If same card
      if (rdmCard > 0.5) setDef(listCollections[rdn].definition);
      // Card is different and make sure of it by looping through the values
      else {
        let rdmDifCard: number = 0;
        rdmDifCard = Math.floor(Math.random() * listCollections.length);
        while (rdmDifCard === rdn) rdmDifCard = Math.floor(Math.random() * listCollections.length);
        setDef(listCollections[rdmDifCard].definition);
        setSameCard(false);
      }
      setPreviousRdn(rdn);
    }
    // Check the collection size. If it does not have 2 items then show an error message
    if (checkCollectionSize(listCollections) !== "") {
      setErrorText(checkCollectionSize(listCollections)!);
      return;
    }
    //Otherwise error value reinitialized
    setErrorText("");
  };

  const checkAnswer = (correctDef: boolean, sameCard: boolean) => {
    if (correctDef === sameCard) {
      setCheckMessage("Correct!");
    } else {
      setCheckMessage("Incorrect!");
    }
    setAnswerSubmitted(true);
  };

  const renderCheckMessage = () => {
    if (checkMessage === "Correct!") return <p className="check-message">{checkMessage}</p>;
    if (checkMessage === "Incorrect!") return <p className="check-message incorrect">{checkMessage}</p>;
    else return null;
  };

  return (
    <div className="wrapper-main">
      <main className="main-view">
        {currentCollection ? (
          <div className="wrapper-practice">
            <PracticeLearnActivity
              functionButton={() => createRandomCard(results)}
              title={`Practice exercise: ${currentCollection}`}
              concept={concept}
              def={def}
              errorText={errorText}
              textInstruction={`In this module ${conceptTypeText(type)?.toLowerCase()}s and ${defTypeText(
                type
              )?.toLocaleLowerCase()}s are shuffled
               and you'll be asked to recognize which ones are correct.`}
            />
            {concept ? (
              <div className="check-practice">
                <p className="question">Is this the correct definition?</p>
                {!answerSubmitted ? (
                  <span className="wrapper-btn-check">
                    <button onClick={() => checkAnswer(true, sameCard)} className="btn-primary">
                      Yes
                    </button>
                    <button onClick={() => checkAnswer(false, sameCard)} className="btn-secondary">
                      No
                    </button>
                  </span>
                ) : null}

                {renderCheckMessage()}
              </div>
            ) : null}
          </div>
        ) : (
          <h3 className="title-s">Select a collection to start practicing.</h3>
        )}
        {currentCollection ? (
          <RenderButton
            functionButton={() => createRandomCard(results)}
            title={`Collection: ${currentCollection}`}
            concept={concept}
            def={def}
            errorText={errorText}
            textInstruction={
              "In this module your cards are mixed up and you'll be asked to recognize which ones are correct."
            }
          />
        ) : null}
      </main>
    </div>
  );
};

export default Practice;
