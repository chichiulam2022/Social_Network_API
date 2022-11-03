const { User, Thought } = require('../models')

const userController = {

    //get all users -> GET /api/users
    getUsers(req, res) {
        User.find({})
            .select('-__v')
            .then((dbUserData) => {
                res.json(dbUserData)
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err)
            })
    },

    //get single user by Id -> GET /api/users/:id
    getSingleUser(req, res) {
        User.findOne({ _id: req.params.userId })
            .select('-__v')
            .populate('friends')
            .populate('thoughts')
            .then((dbUserData) => {
                !dbUserData
                    ? res.status(404).json({ message: 'No user with this id, please try again' })
                    : res.json(dbUserData)
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err)
            })
    },

    //create a new user -> POST /api/users
    createUser(req, res) {
        User.create(req.body)
            .then((dbUserData) => {
                res.json(dbUserData)
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err)
            })
    },

    //update a user -> PUT /api/users/:id
    updateUser(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $set: req.body },
            { runValidators: true, new: true }
        )
            .then((dbUserData) => {
                !dbUserData
                    ? res.status(404).json({ message: 'No user with this id, please try again' })
                    : res.json(dbUserData)
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err)
            })
    },

    //delete user and delete associated thoughts -> DELETE /api/users/:id
    deleteUser(req, res) {
        User.findOneAndDelete({ _id: req.params.userId })
            .then((dbUserData) => {
                !dbUserData
                    ? res.status(404).json({ message: 'No user with this id, please try again' })
                    : Thought.deleteMany({ _id: { $in: dbUserData.thoughts } })
            })
            .then(() => {
                res.json({ message: 'User and thoughts successfully deleted' })
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err)
            })
    },


    //add friends to the list -> POST /api/users/:userId/friends/:friendId
    addFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $addToSet: { friends: req.params.friendId } },
            { runValidators: true, new: true }
        )
            .then((dbUserData) => {
                !dbUserData
                    ? res.status(404).json({ message: 'No user with this id, please try again' })
                    : res.json(dbUserData)
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err)
            })
    },

    // Remove friend from friend list -> DELETE /api/users/:userId/friends/:friendId
    removeFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $pull: { friends: req.params.friendId } },
            { new: true }
        )
            .then((dbUserData) => {
                !dbUserData
                    ? res.status(404).json({ message: "No user with this id!" })
                    : res.json(dbUserData);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    }

}

module.exports = userController