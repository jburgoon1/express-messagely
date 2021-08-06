const Express = require('express')
const router = new Express.Router()
const user = require('../models/user')
const {ensureCorrectUser} = require('../middleware/auth')


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', async (req,res,next) =>{
    try{
        const allUsers = await user.all()
        return res.json(allUsers)
    }catch(e){
        return next(e)
    }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', async (req, res, next) =>{
    try{
        const username = req.params.username
        const thisUser = await user.get(username)
        return res.json(thisUser)
    }catch(e){
        return next(e)
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', ensureCorrectUser, async(req, res, next) =>{
    try{
        const username = req.params.username
        const toMessages = await user.messagesTo(username)
        return res.json(toMessages)
    }catch(e){
        return next(e)
    }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', ensureCorrectUser, async (req, res, next) =>{
    try{
        const username = req.params.username
        const fromMessages = await user.messagesFrom(username)
        return res.json(fromMessages)
    }catch(e){
        return next(e)
    }
})

module.exports = router