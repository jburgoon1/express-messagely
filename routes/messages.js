const Express = require('express')
const router = new Express.Router()
const messages = require('../models/message')
const {ensureCorrectUser, ensureLoggedIn} = require('../middleware/auth')

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureCorrectUser, async (req, res, next) =>{
    try{
        const message = req.params.id
        const result = await messages.get(message)
        return res.json(result)

    }catch(e){
        return next(e)
    }
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

 router.post('/', ensureLoggedIn, async (req, res, next)=>{
     try{
        const {from_username, to_username, message_body} = req.body
        const newMessage = await messages.create(from_username, to_username, message_body)
        return res.json(newMessage)
     }catch(e){
         return next(e)
     }
 })


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureCorrectUser, async (req, res, next)=>{
    try{
       const messageId = req.params.id
       const result = await messages.markRead(messageId)
       return res.json(result)
    }catch(e){
        return next(e)
    }
})

module.exports = router

