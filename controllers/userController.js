// ObjectId() method for converting userId string into an ObjectId for querying database
const { ObjectId } = require('mongoose').Types;
const { User, Thought } = require('../models');

// Aggregate function to get the number of users overall
const userCount = async () => {
  
  const numberOfUsers = await User.aggregate().count('userCount');

  return numberOfUsers;
}

module.exports = {
  // Get all users
  async getUsers(req, res) {
    try {
      const users = await User.find().select('-__v').populate('thoughts');
      const userObj = {
        users,
        userCount: await userCount(),
      };
      return res.json(userObj);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },

  // Get a single user
  async getSingleUser(req, res) {
    try {
      const user = await User.findOne({ _id: req.params.userId })
        .select('-__v')
        .populate('thoughts');

      if (!user) {
        return res.status(404).json({ message: 'No user with that ID' });
      }

      res.json({
        user
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },

  // create a new user
  async createUser(req, res) {
    try {
      const user = await User.create(req.body);
      res.json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // Delete a user 
  async deleteUser(req, res) {
    try {
      const user = await User.findOne({ _id: req.params.userId })
        .select('-__v');

      await Thought.deleteMany({ _id: { $in: user.thoughts } });
      // res.json({ message: 'Thoughts deleted!' });

      const userToDelete = await User.findOneAndDelete({ _id: req.params.userId });

      if (!userToDelete) {
        return res.status(404).json({ message: 'No such user exists' })
      }
      res.json({ message: 'User and thoughts successfully deleted' });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  // Update a user
  async updateUser(req, res) {
    try {
      const user = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { $set: req.body },
        { runValidators: true, new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'No user with this id!' });
      }

      res.json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },



  // Add a friend to a user
  async addFriend(req, res) {
    try {
      console.log('You are adding a friend');
      console.log(req.body);

      const newFriend = await User.findOne({ _id: req.params.friendId })
        .select('-__v')
        .lean();

      if (!newFriend) {
        return res
          .status(404)
          .json({ message: 'No user found with that ID :(' })
      }


      const user = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { $addToSet: { friends: newFriend } },
        { runValidators: true, new: true }
      );

      if (!user) {
        return res
          .status(404)
          .json({ message: 'No user found with that ID :(' })
      }

      res.json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Remove assignment from a user
  async removeFriend(req, res) {
    try {

      const oldFriend = await User.findOne({ _id: req.params.friendId });

      if (!oldFriend) {
        return res
          .status(404)
          .json({ message: 'No friend user found with that ID :(' })
      }
      
      const user = await User.findByIdAndUpdate(
        { _id: req.params.userId },
        { $pull: { friends: req.params.friendId } },
        { new: true }
      ).populate('friends');

      if (!user) {
        return res
          .status(404)
          .json({ message: 'No user found with that ID :(' });
      }

      res.json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};


