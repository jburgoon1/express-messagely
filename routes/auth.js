const Express = require('express')
const router = new Express.Router()
const User = require('../models/user')
const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require('../config')


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) =>{
    try{
        const {username, password} = req.body
        User.authenticate(username, password)
        User.updateLoginTimestamp(username)
        let token = jwt.sign({username: username}, SECRET_KEY)
        return res.json({mg:`Welcome back ${username}`, _token: token});
    }catch(e){
        next(e)
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

 router.post('/register', async (req, res, next) =>{
     try{
        const {username, password, first_name, last_name, phone} = req.body
        const newUser = await User.register({username, password, first_name,last_name, phone})
        const payload = {username: newUser.username}
        let token = jwt.sign(payload, SECRET_KEY)
        console.log(token)
        return res.json({username, token});
     }catch(e){
         return next(e)
     }
 })

 module.exports = router
