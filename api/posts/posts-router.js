// implement your posts router here
const express = require('express')
const { restart } = require('nodemon')
const router = express.Router()
const Post = require('./posts-model')

//GET
router.get('/', (req, res) => {
    Post.find(req.query)
        .then(posts => {
            res.status(200).json(posts)
        })
        .catch(error => {
            res.status(500).json({ message: "The posts information could not be retrieved" })
            console.log(error)
        })
})

router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(posts => {
            if (posts) {
                res.status(200).json(posts)
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist" })
            }
        })
        .catch(error => {
            res.status(500).json({ message: "The post information could not be retrieved" })
            console.log(error)
        })
})

//POST
router.post('/', (req, res) => {
    const { title, contents } = req.body
    if (!title || !contents) {
        res.status(400).json({
            message: "Please provide title and contents for the post"
        }) 
    } else {
        Post.insert({ title, contents })
            .then(({ id }) => {
                return Post.findById(id)
            })
            .then(post => {
                res.status(201).json(post)
            })
            .catch(error => {
                res.status(500).json({ message: "There was an error while saving the post to the database" })
                console.log(error)
            })
    }
})

//DELETE
router.delete('/:id', async (req, res) => {
    try {
        const deletedPost = await Post.findById(req.params.id)
        if (!deletedPost) {
            res.status(404).json({ message: "The post with the specified ID does not exist" })
        } else {
            await Post.remove(req.params.id)
            res.json(deletedPost)
        }
    } catch(error) {
        res.status(500).json({ message: "The post could not be removed" })
        console.log(error)
    }
})

//PUT
router.put('/:id', (req, res) => {
    const { title, contents } = req.body
    if (!title || !contents) {
        res.status(400).json({ message: "Please provide title and contents for the post" })
    } else {
        Post.findById(req.params.id)
            .then(update => {
                if (!update) {
                    res.status(404).json({ message: "The post with the specified ID does not exist" })
                } else {
                    return Post.update(req.params.id, req.body)
                }
            })
            .then(numberUpdated => {
                if (numberUpdated) {
                    return Post.findById(req.params.id)
                }
            })
            .then(updatedPost => {
                if (updatedPost) {
                    res.json(updatedPost)
                }
            })
            .catch(error => {
                res.status(500).json({ message: "The post information could not be modified" })
                console.log(error)
            })
    }
})

//GET messages
router.get('/:id/comments', async (req, res) => {
    try {
        const onPost = await Post.findById(req.params.id)
        if (!onPost) {
            res.status(404).json({ message: "The post with the specified ID does not exist" })
        } else {
            const postComments = await Post.findPostComments(req.params.id)
            res.json(postComments)
        }
    } catch(error) {
        res.status(500).json({ message: "The comments information could not be retrieved" })
        console.log(error)
    }
})

module.exports = router