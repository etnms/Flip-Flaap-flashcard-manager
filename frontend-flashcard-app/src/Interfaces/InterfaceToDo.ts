export interface ITodo {
    _id: string;
    date: Date;
    todo: string;
    color: string,
    setItemChange: Function;
    displayIndex: number; // Display in the view, used for the DnD system
    dbIndex: number, // Index in the DB for sorting when getting the collection
    moveItemList: Function,
    editFlashcardIndexes: Function
  }
  
  
  