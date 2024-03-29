import "./Flashcard.scss";
import "../App.scss";
import "../SassStyles/icons.scss";
import { IFlashcard } from "../Interfaces/InterfaceFlashcard";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import axios from "axios";
import React, { useRef, useState } from "react";
import Loader from "./Loaders/Loader";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { conceptTypeText, defTypeText, formatDate } from "../helper/helper";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { changeExpiredStatus } from "../features/expiredSessionSlice";
import { useDrag, useDrop } from "react-dnd";
import { Dispatch } from "redux";

const Flashcard = (props: React.PropsWithChildren<IFlashcard>) => {
  const { _id, concept, date, definition, editFlashcardIndexes, displayIndex, moveItemList, setItemChange } =
    props;

  const token: string | null = localStorage.getItem("token");

  const [edit, setEdit] = useState<boolean>(false);

  const type: string = useAppSelector((state) => state.currentCollection.type);
  const idCollection: string = useAppSelector((state) => state.currentCollection._id);

  const dispatch: Dispatch<any> = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();

  const [conceptText, setConceptText] = useState<string>(concept);
  const [defText, setDefText] = useState<string>(definition);

  const [loadingDelete, setLoadingDelete] = useState<boolean>(false);

  const deleteFlashcard = (
    _id: string,
    idCollection: string,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setLoadingDelete(true);
    // Select the flashcard element for animation purposes
    const spanEl: HTMLElement | null = (e.target as HTMLElement).parentElement; //span
    const flashcardEl: HTMLElement | null | undefined = spanEl?.parentElement;
    axios
      .delete(`https://flip-flaap-backend.onrender.com/api/flashcards`, {
        data: { _id, idCollection },
        headers: { Authorization: token! },
      })
      .then(() => {
        // Animation only, the backedn takes care of the delete logic
        flashcardEl?.classList.add("deleted-item");
        // Time out before state refresh to see the updated collection
        // There's probably a better way to do that but it works
        setTimeout(() => setItemChange(true), 100);
        setLoadingDelete(false);
      })
      .catch((err) => {
        if (err.response.status === 403) {
          navigate("/redirect");
          dispatch(changeExpiredStatus(true));
        }
        setLoadingDelete(false);
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLElement>, elementName: string) => {
    if (elementName === "concept") setConceptText((e.target as HTMLInputElement).value);
    if (elementName === "definition-edit") setDefText((e.target as HTMLInputElement).value);
  };

  const editFlashcard = () => {
    axios
      .put(
        `https://flip-flaap-backend.onrender.com/api/flashcards`,
        {
          _id,
          concept: conceptText,
          definition: defText,
        },
        { headers: { Authorization: token! } }
      )
      .then(() => {
        setEdit(false);
      })
      .catch((err) => {
        if (err.response.status === 403) {
          navigate("/redirect");
          dispatch(changeExpiredStatus(true));
        }
      });
  };

  // Drag and drop logic
  // Drag
  const [{ isDragging }, dragRef] = useDrag({
    type: "flashcard",
    item: { displayIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // useDrop - each item is a drop area
  const [, dropRef] = useDrop({
    accept: ["flashcard"],
    hover: (item: IFlashcard, monitor: any) => {
      const dragIndex: number = item.displayIndex;
      const hoverIndex: number = displayIndex;
      const hoverBoundingRect: DOMRect | undefined = ref?.current?.getBoundingClientRect();

      const hoverMiddleY: number = (hoverBoundingRect!.bottom - hoverBoundingRect!.top) / 2;
      const hoverActualY: number = monitor.getClientOffset().y - hoverBoundingRect!.top;

      const hoverMiddleX: number = (hoverBoundingRect!.left - hoverBoundingRect!.right) / 2;
      const hoverActualX: number = monitor.getClientOffset().x - hoverBoundingRect!.right;

      // if dragging down, continue only when hover is smaller than middle Y
      if (dragIndex < hoverIndex && hoverActualY < hoverMiddleY) return;
      // if dragging up, continue only when hover is bigger than middle Y
      if (dragIndex > hoverIndex && hoverActualY > hoverMiddleY) return;

      if (dragIndex < hoverIndex && hoverActualX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverActualX > hoverMiddleX) return;

      moveItemList(dragIndex, hoverIndex);
      item.displayIndex = hoverIndex;
    },
    drop: () => {
      editFlashcardIndexes(`https://flip-flaap-backend.onrender.com/api/flashcards/index`);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // refs for DnD
  const ref: React.MutableRefObject<HTMLDivElement | undefined> = useRef<HTMLDivElement>();
  const dragDropRef: React.ReactElement<any, string | React.JSXElementConstructor<any>> | null = dragRef(dropRef(ref));

  const renderFlashcard = () => {
    if (edit) {
      return (
        <div
          className="flashcard"
          ref={dragDropRef as any}
          style={{ opacity: isDragging ? 0 : 1 }}
          tabIndex={0}>
          <input
            name="concept"
            className="edit-text title-flashcard"
            type="text"
            value={`${conceptText}`}
            onChange={(e) => handleChange(e, "concept")}
          />
          <textarea
            name="definition-edit"
            value={`${defText}`}
            className="edit-text edit-def"
            onChange={(e) => handleChange(e, "definition-edit")}></textarea>
          <p className="created-on-text">Created on: {<em>{formatDate(date)}</em>}</p>
          <span className="wrapper-btn-flashcards">
            {renderDelBtn()}
            <button
              onClick={() => editFlashcard()}
              className="icon-cards icon-edit"
              aria-label="validate edit">
              <CheckIcon />
            </button>
          </span>
        </div>
      );
    } else {
      return (
        <div
          className="flashcard"
          ref={dragDropRef as any}
          style={{ opacity: isDragging ? 0 : 1 }}
          tabIndex={0}>
          <h2 className="title-flashcard">
            {conceptTypeText(type)}: <strong>{conceptText}</strong>
          </h2>
          <p className="def-text">
            {defTypeText(type)}: {defText}
          </p>
          <p className="created-on-text">Created on: {<em>{formatDate(date)}</em>}</p>
          <span className="wrapper-btn-flashcards">
            {renderDelBtn()}
            <button
              onClick={() => setEdit(true)}
              className="icon-cards icon-edit"
              aria-label="edit">
              <EditIcon />
            </button>
          </span>
        </div>
      );
    }
  };

  // Common delete button between view/edit modes
  const renderDelBtn = () => {
    // Loading animation if item is being deleted
    if (loadingDelete) return <Loader />;
    else
      return (
        <button
          onClick={(e) => deleteFlashcard(_id, idCollection, e)}
          className="icon-cards icon-delete"
          aria-label="delete">
          <DeleteOutlinedIcon />
        </button>
      );
  };

  // Actual component
  return renderFlashcard();
};

export default Flashcard;
