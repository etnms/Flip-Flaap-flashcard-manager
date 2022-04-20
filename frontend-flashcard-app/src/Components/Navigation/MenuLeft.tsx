import "../../SassStyles/icons.scss";
import "./MenuLeft.scss";
import "../../SassStyles/TitlesAndTexts.scss";
import Icon from "../../Assets/Flip-Flaap-white.png";
import DeleteConfirm from ".././DeleteConfirm";
import { IMenuProps } from "../../Interfaces/InterfaceMenu";
import { useState } from "react";
import MenuLeftItem from "./MenuLeftItem";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { openCollectionForm } from "../../features/openCollectionFormSlice";

const MenuLeft = (props: React.PropsWithChildren<IMenuProps>) => {
  const { collectionNames } = props;

  const dispatch = useAppDispatch();

  const confirmDeleteOpen = useAppSelector((state) => state.confirmDeleteMenu.value);
  // Prop drilling for the selectedHTML as redux is not really a good option here (not a "normal" object)
  const [selectedHTML, setSelectedHTML] = useState<HTMLElement>();

  // Main function to display individual items with collection names and buttons
  const displayNames = (type: string) => {
    //if type === result.type then do
    return collectionNames.map((result) => {
      if (type === result.type)
        return (
          <li key={result._id}>
            <MenuLeftItem _id={result._id} name={result.name} type={result.type} setSelectedHTML={setSelectedHTML} />
          </li>
        );
      return null;
    });
  };

  const hideCollections = (type: string) => {
    // Hide collection
    const collectionHide = document.querySelector(`.collec-${type}`);
    collectionHide?.classList.toggle("collec-hidden");
    // Change arrow's orientation
    const arrow = document.querySelector(`.arrow-${type}`);
    arrow?.classList.toggle("arrow-down");
  };

  return (
    <div className="menu-left">
      <img src={Icon} alt="icon" className="icon-main"/>
      <h1 className="title">Collections</h1>

      <span onClick={() => hideCollections("concept")} className="wrapper-subtitle">
        <h2 className="menu-subtitle">Concepts</h2>
        <span className="arrow arrow-concept"></span>
      </span>
      <ul className="nav-collections collec-concept">{displayNames("concept")}</ul>

      <span onClick={() => hideCollections("language")} className="wrapper-subtitle">
        <h2 className="menu-subtitle">
          Languages
        </h2>
        <span className="arrow arrow-language"></span>
      </span>
      <ul className="nav-collections collec-language">{displayNames("language")}</ul>

      <span onClick={() => hideCollections("to-do")} className="wrapper-subtitle">
        <h2 className="menu-subtitle">
          To dos
        </h2>
        <span className="arrow arrow-to-do"></span>
      </span>
      <ul className="nav-collections collec-to-do">{displayNames("to-do")}</ul>
      <button onClick={() => dispatch(openCollectionForm(true))} className="btn-white btn-new-collec">
        Create new collection
      </button>
      {confirmDeleteOpen ? (
        <DeleteConfirm // Component to give confirm message if collection needs to be deleted
          selectedHTML={selectedHTML!}
        />
      ) : null}
    </div>
  );
};

export default MenuLeft;