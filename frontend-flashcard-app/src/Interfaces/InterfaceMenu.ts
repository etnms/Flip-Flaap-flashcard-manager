export interface IMenuProps {
  collectionNames: Array<Collection>;
}

type Collection = {
    name: string;
    _id: string;
    type: string;
  };

export interface IMenuLeftItem {
    _id: string;
    name: string;
    setSelectedHTML: Function;
    type: string;
  }