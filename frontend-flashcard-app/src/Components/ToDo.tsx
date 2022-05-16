import "../App.scss";
import "../SassStyles/icons.scss";
import "./ToDo.scss";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import axios from "axios";
import React, { useRef, useState } from "react";
import Loader from "./Loaders/Loader";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { defTypeText, formatDate } from "../helper/helper";
import { useNavigate } from "react-router-dom";
import { changeExpiredStatus } from "../features/expiredSessionSlice";
import { ITodo } from "../Interfaces/InterfaceToDo";
import "./CustomSelect.scss";
import CustomSelect from "./CustomSelect";
import { useDrag, useDrop } from "react-dnd";

const ToDo = (props: React.PropsWithChildren<ITodo>) => {
  const {
    _id,
    color,
    date,
    editFlashcardIndexes,
    displayIndex,
    moveItemList,
    todo,
    setItemChange,
  } = props;

  const token = localStorage.getItem("token");

  const [edit, setEdit] = useState(false);

  const type = useAppSelector((state) => state.currentCollection.type);
  const idCollection = useAppSelector((state) => state.currentCollection._id);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [todoText, setTodoText] = useState(todo);

  const [loadingDelete, setLoadingDelete] = useState(false);

  const [currentColor, setCurrentColor] = useState(color); // Default to white
  const colorValues = [
    "none",
    "red",
    "yellow",
    "orange",
    "#2BFF52",
    "cyan",
    "#5073FF",
    "#F454FF",
    "purple",
    "black",
  ];

  const deleteTodo = (_id: string, idCollection: string, e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    setLoadingDelete(true);
    // Select the flashcard element for animation purposes
    const spanEl = (e.target as HTMLElement).parentElement; //span
    const flashcardEl = spanEl?.parentElement;
    axios
      .delete(`${process.env.REACT_APP_BACKEND}/api/todos`, {
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
    if (elementName === "definition-edit") setTodoText((e.target as HTMLInputElement).value);
  };

  const editTodo = () => {
    axios
      .put(
        `${process.env.REACT_APP_BACKEND}/api/todos`,
        {
          _id,
          definition: todoText,
          color: currentColor,
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
    type: "todo",
    item: { displayIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // useDrop - each item is a drop area
  const [, dropRef] = useDrop({
    accept: ["todo"],
    hover: (item: ITodo, monitor: any) => {
      const dragIndex = item.displayIndex;
      const hoverIndex = displayIndex;
      const hoverBoundingRect = ref?.current?.getBoundingClientRect();

      const hoverMiddleY = (hoverBoundingRect!.bottom - hoverBoundingRect!.top) / 2;
      const hoverActualY = monitor.getClientOffset().y - hoverBoundingRect!.top;

      const hoverMiddleX = (hoverBoundingRect!.left - hoverBoundingRect!.right) / 2;
      const hoverActualX = monitor.getClientOffset().x - hoverBoundingRect!.right;

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
      editFlashcardIndexes(`${process.env.REACT_APP_BACKEND}/api/todos/index`);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // refs for DnD
  const ref = useRef<HTMLDivElement>();
  const dragDropRef = dragRef(dropRef(ref));

  const renderTodo = () => {
    if (edit) {
      return (
        <div className="to-do" ref={dragDropRef as any} style={{ opacity: isDragging ? 0 : 1 }}>
          <textarea
            name="definition-edit"
            value={`${todoText}`}
            className="edit-to-do-text edit-to-do"
            onChange={(e) => handleChange(e, "definition-edit")}></textarea>
          <CustomSelect
            colorOnly={true}
            currentValue={currentColor}
            setSelect={setCurrentColor}
            values={colorValues}
            displayUp={true}
          />
          <p className="created-on-text">Created on: {<em>{formatDate(date)}</em>}</p>
          <span className="wrapper-btn-todos">
            <CheckIcon
              onClick={() => editTodo()}
              className="icon icon-edit"
              aria-label="button validate edit"
            />
            {renderDelBtn()}
          </span>
        </div>
      );
    } else {
      return (
        <div className="to-do" ref={dragDropRef as any} style={{ opacity: isDragging ? 0 : 1 }}>
          <p className="def-text to-do-def">
            <strong>{defTypeText(type)}</strong>: {todoText}
          </p>
          {currentColor !== "none" ? (
            <span className="to-do-color" style={{ backgroundColor: `${currentColor}` }}></span>
          ) : null}
          <p className="created-on-text">Created on: {<em>{formatDate(date)}</em>}</p>
          <span className="wrapper-btn-todos">
            <EditIcon
              onClick={() => setEdit(true)}
              className="icon icon-edit"
              aria-label="button validate edit"
            />
            {renderDelBtn()}
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
        <DeleteOutlinedIcon
          onClick={(e) => deleteTodo(_id, idCollection, e)}
          className="icon icon-delete"
          aria-label="button delete to do"
        />
      );
  };

  return renderTodo();
};

export default ToDo;