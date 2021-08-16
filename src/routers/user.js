const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user')
const multer = require('multer');
const sharp = require('sharp');
const {sendWelcomeEmail} = require('../emails/account');
const {sendCancelEmail} = require('../emails/account');
//create a new user
router.post('/user', async(req, res) => {
    const user = new User(req.body);
    
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.username);
        const token = await user.generateAuthToken();
        res.status(201).send({user,token})
    }
    catch(err){
        res.status(500).send(err)
    }
    
       
})

//get all users
router.get('/user/me',auth,async(req, res) => {
    res.send(req.user)
})



router.post('/user/login', async(req, res) => {
    try{
        const user  = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user,token})
    }catch(err){
        console.log('xxx')
        res.status(400).send()
    }
})


router.post('/user/logout',auth,async(req, res) => {
    console.log('a')
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token != req.token
        })
        await req.user.save()
        res.status(200).send('logged out')
    }catch(err){
        console.log('xx')
        res.send(err)
    }
})


router.post('/user/logoutAll',auth,async(req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send('logged out') 
        
    }catch(err){
        console.log('xx')
        res.send(err)
    }
})



router.put('/user/me',auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['username', 'age', 'email', 'password']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send('Invalid update operation')
    }
    try{
        // const user = await User.findById(req.user.id)
        updates.forEach(update => {
            req.user[update] = req.body[update]
         })
        // await user.save()
        // if(!user){
        //     return res.status(404).send('User not found')
        // }
        await req.user.update(req.body)
        res.status(200).send(req.user)
    }
        
        catch(err){
            return res.status(500).send(err)
        }
        })




router.delete('/user/me',auth,async(req, res) => {
    try{
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.username)
        res.status(200).send('your account has been deleted')
    }
    catch(err){
        res.send(err)
    }
})

const upload = multer({
    
    limits:{
        fileSize: 1*1024*1024, // 1mb,
        },
        fileFilter(req,file,cb){
            if(file.originalname.match(/\.(jpg|png|jpeg)$/)){
            
            // cb(new Error('file must be image'))
            cb(undefined,true)
        }else{
            
            return cb(new Error('file must be image'))
        }
}})

router.post('/user/me/avatar',auth,upload.single('avatar'),async(req, res) => {
    const buffer = await sharp(req.file.buffer).png().resize({width : 250,height :250}).toBuffer()
    
    req.user.avatar = buffer
    await req.user.save()
    res.status(200).send('uploaded')
},(error,req,res,next)=>{
    res.status(400).send(error.message)
})

router.delete('/user/me/avatar',auth,async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send('deleted')
})

router.get('/users/:id/avatar',async(req, res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(err){
        res.status(404).send()
    }
})


module.exports = router;