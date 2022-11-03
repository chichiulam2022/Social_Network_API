const { User, Thought } = require('../models')

const thoughtController = {
    //get all thoughts -> /api/thougts
    getThoughts(req, res) {
        Thought.find({})
            .populate({ path: 'reactions', select: '-__v' })
            .then(dbThoughtData => res.json(dbThoughtData))
            .catch(err => {
                console.log(err);
                res.status(500).json(err)
            })
    },

    // get a thought by id -> /api/thoughts/:id
    getThoughtById(req, res) {
        Thought.findOne({ _id: req.params.id })
            .populate({ path: 'reactions', select: '-__v' })
            .then(dbThoughtData => {
                !dbThoughtData
                    ? res.status(404).json({ message: 'No thought found with this id. Please try again' })
                    : res.json(dbThoughtData)
            })
            .catch(err => {
                res.status(500).json(err)
            })
    },

    //create thoughts
    createThought(req, res) {
        Thought.create(req.body)
            .then((dbThoughtData) => {
                User.findOneAndUpdate(
                    { username: req.body.username },
                    { $push: { thoughts: dbThoughtData } },
                    { new: true }
                )
                    .then(dbUserData => {
                        !dbUserData
                            ? res.status(404).json({ message: 'No user found with this id. Please try again' })
                            : res.json(dbUserData)
                    })
                    .catch(err => res.status(500).json(err))
            })
    },



    //update thoughts
    updateThought(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $set: req.body },
            { runValidators: true, new: true }
        )
            .then((dbThoughtData) =>
                !dbThoughtData
                    ? res.status(404).json({ message: 'No thought found with this id. Please try again' })
                    : res.json(dbThoughtData)
            )
            .catch((err) => res.status(500).json(err))
    },

    //delete a thought -> /api/thoughts/:id
    deleteThought(req, res) {
        Thought.findOneAndDelete({ _id: req.params.thoughtId })
            .then((dbThoughtData) =>
                !dbThoughtData
                    ? res.status(404).json({ message: 'No thought found with this id. Please try again' })
                    : User.findOneAndUpdate(
                        { thoughts: req.params.thoughtId },
                        { $pull: { thoughts: req.params.thoughtId } },
                        { new: true }
                    )
            )
            .then((dbUserData) =>
                !dbUserData
                    ? res.status(404).json({ message: 'Thought successfully deleted, but no user found' })
                    : res.json({ message: 'Thought successfully deleted' })
            )

    },

    //create reaction
    createReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $addToSet: { reactions: req.body } },
            { runValidators: true, new: true }
        )
            .then((dbThoughtData) => {
                !dbThoughtData
                    ? res.status(404).json({ message: 'No thought found with this id. Please try again' })
                    : res.json(dbThoughtData)
            })
            .catch((err) => res.status(500).json(err));
    },

    deleteReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            //pull = delete
            { $pull: { reactions: { reactionId: req.params.reactionId } } },
            { runValidators: true, new: true }
        )
            .then((dbThoughtData) =>
                !dbThoughtData
                    ? res.status(404).json({ message: 'No thought found with this id. Please try again' })
                    : res.json(dbThoughtData)
            )
            .catch((err) => res.status(500).json(err));
    }
}

module.exports = thoughtController;