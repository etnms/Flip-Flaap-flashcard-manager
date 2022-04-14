import jwt from "jsonwebtoken";
import Collection from "../models/collections.js";
import User from "../models/user.js";
import async from "async";

const getCollection = (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.status(400);
      return;
    }
    User.findOne({ user: authData.user.username }).exec((err, result) => {
      if (err) {
        console.log(err);
        return;
      } else
        async.parallel(
          {
            collections: (callback) => {
              Collection.find({ user: result }).populate("name").exec(callback);
            },
          },
          (err, results) => {
            if (err) {
              res.status(400).send(err);
            }
            res.status(200).json({ results });
          }
        );
    });
  });
};

const postCollection = (req, res) => {
  const name = req.body.name;

  if (name.length > 80) {
    res.status(400).json({ error: "Name too long" });
    return;
  }

  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.status(403);
      return;
    } else {
      User.findOne({ username: authData.user.username }).exec((err, result) => {
        if (err) {
          res.status(400).json({ error: "Error creation collection" });
          return;
        }
        if (result) {
          new Collection({
            name,
            user: result,
          }).save((err) => {
            if (err) {
              res.status(400).json({ error: "Error field empty" });
              return;
            } else {
              res.status(200).json({ message: "Collection created" });
              //name: result.name, _id: result._id, user: result.user.name,
              return;
            }
          });
        }
      });
    }
  });
};

const deleteCollection = (req, res) => {
  const _id = req.body._id;

  jwt.verify(req.token, "secretkey", (err) => {
    if (err) {
      res.status(403);
    } else {
      Collection.deleteOne({ _id }, (err) => {
        if (err) {
          console.log(err);
          res.status(400).json({ error: "Error deleting collection" });
          return;
        } else {
          res.status(200).json({ message: "Successfully deleted" });
        }
      });
    }
  });
};

const editCollection = (req, res) => {
  const _id = req.body._id;
  const name = req.body.name;

  jwt.verify(req.token, "secretkey", (err) => {
    if (err) {
      res.send(403);
      return;
    }
    Collection.findByIdAndUpdate({ _id }, { name }, (err) => {
      if (err) {
        res.status(400).json({ error: "Problem renaming collection" });
        return;
      }
      res.status(200).json({ message: "Collection name updated" });
    });
  });
};

export { deleteCollection, editCollection, getCollection, postCollection };