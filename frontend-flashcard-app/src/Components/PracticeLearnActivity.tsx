import "./PracticeLearningActivity.scss";
import axios from "axios";
import React from "react";
import ErrorMessage from "./ErrorMessage";
import { IActivity } from "../Interfaces/InterfaceActivity";
import { useAppSelector } from "../app/hooks";
import { conceptTypeText, defTypeText } from "../helper/helper";

export const PracticeLearnActivity = (props: React.PropsWithChildren<IActivity>) => {
  const { title, concept, def, errorText, textInstruction } = props;

  const collectionType: string = useAppSelector((state) => state.currentCollection.type);
  const renderCard = () => {
    if (concept)
      return (
        <div className="learn-flashcard">
          <div className="card-inner">
            <h2 className="title-flashcard card-front">
              {conceptTypeText(collectionType)}: <strong>{concept}</strong>
            </h2>
            <p className="def-text card-back">
              {defTypeText(collectionType)}: {def}
            </p>
          </div>
        </div>
      );
    else {
      if (errorText === "")
        return (
          <div className="begin-text">
            <p>{textInstruction}</p>
            <p>
              Once you start, hover over your flashcards to flip them. If you're on a mobile device, you can
              tap them to achieve the same result.
            </p>
            <p>Press start to begin.</p>
          </div>
        );
      return null;
    }
  };
  return (
    <div className="learn-flashcard-wrapper">
      <h1 className="title">{title}</h1>
      {renderCard()}
    </div>
  );
};

export const RenderButton = (props: React.PropsWithChildren<IActivity>) => {
  const { errorText, concept, functionButton } = props;
  if (errorText === "")
    return (
      <button onClick={() => functionButton()} className="btn-tertiary space-s">
        {concept ? "Next" : "Start"}
      </button>
    );
  else return <ErrorMessage textError={errorText} />;
};

export const Getdata = (
  currentCollectionId: string,
  setConcept: Function,
  setErrorText: Function,
  setResults: Function,
  setExpired: Function
) => {
  setConcept(""); //reinitialize value in case of change of collection
  setErrorText("");
  setExpired(false);
  const token: string | null = localStorage.getItem("token");
  if (currentCollectionId !== "") {
    axios({
      method: "GET",
      url: `https://flip-flaap-backend.onrender.com/api/flashcards`,
      params: { currentCollectionId },
      headers: { Authorization: token! },
    })
      .then((res) => {
        setResults(res.data.results.collections.flashcards);
      })
      .catch((err) => {
        if (err.response.status === 403) setExpired(true);
        setResults([]);
      });
  }
};

export const checkCollectionSize = (listCollections: Array<Object>) => {
  if (listCollections[0] === undefined)
    return "Error: This collection is empty! Please create some flashcards and come back.";
  if (listCollections[1] === undefined)
    return "Error: This collection only contains one flashcard. Create at least 2 flashcards and come back.";
  return "";
};

// Creates a fake flashcard for the "swipe" animation
export const createFakeFlashcard = (concept: string, def: string) => {
  const main: Element | null = document.querySelector(".main-view");

  const fakecard: HTMLDivElement = document.createElement("div");
  fakecard.classList.add("learn-flashcard");

  // Only show the concept part of the card and not the full card
  // If flip animation is not activated then showing the full card makes sense, see comment below
  const titleText: HTMLHeadingElement = document.createElement("h2");
  titleText.textContent = `Concept ${(<strong>{concept}</strong>)}`;
  titleText.classList.add("title-flashcard");

  /*
  const defText = document.createElement("p");
  defText.textContent = `Definition: ${def}`;
  defText.classList.add("def-text");
*/
  fakecard.appendChild(titleText);
  // fakecard.appendChild(defText);
  fakecard.classList.add("fake-card");
  if (localStorage.getItem("darkmode") === "darkmode") fakecard.classList.add("darkmode-primary");
  main?.append(fakecard);

  setTimeout(() => {
    removeFakeFlashcard();
  }, 650); // Set shorter time than animation time
};

export const removeFakeFlashcard = () => {
  const element: HTMLCollectionOf<Element> = document.getElementsByClassName("fake-card");
  while (element.length > 0) element[0].remove();
};
