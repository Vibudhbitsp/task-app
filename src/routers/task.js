const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task')


//create a task using async await
router.post('/task',auth, async(req, res) => {
    
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }
    catch(err){
        res.status(500).send(err)
    }
})


//get all tasks using async await
router.get('/task',auth, async(req, res) => {
    const match = {}
    const sort ={}
    if (req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy){
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc'?-1:1
    }

    try{
        await req.user.populate({
            path : 'tasks',
            match,
            options:{
                limit : parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            },
            
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    }
    catch(err){
        res.send(err)
    }
})


//get a specific task using async await
router.get('/task/:id',auth, async(req, res) => {
    console.log('a')
    const _id = req.params.id
    try{
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task){
            res.status(404).send('Task not found')
        }
        
        res.status(200).send(task)
    }
    catch(err){
        res.send(err)
    }
})

router.put('/task/:id',auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))
    const _id = req.params.id
    if(!isValidOperation){
        return res.status(400).send('Invalid update operation')
    }

    try{
        const task = await Task.findOne({_id, owner: req.user._id})
        

        if(!task){
            return res.status(404).send('Task not found')
        }

        updates.forEach(update => {
            task[update] = req.body[update]
        })
        await task.save()
        res.status(200).send(task)
    }
    catch(err){
        res.send(err)
    }
})

router.delete('/task/:id',auth, async(req, res) => {
    try{
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if(!task){
            return res.status(404).send('Task not found')
        }
        res.status(200).send(task)
    }
    catch(err){
        res.send(err)
    }
})

module.exports = router;