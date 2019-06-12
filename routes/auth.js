var express = require('express');
var router = express.Router();
var models = require('../models/models')
var crypto = require('crypto')

let generateToken = (username) => {
  var random = Math.random().toString()
  return crypto.createHash('sha1').update(username + random).digest('hex')
}

let checkAuthInfo = async (req, res, next) => {
  console.log("checking Auth Info...")
  let authCred = req.body['user']
  console.log(authCred)
  if(!authCred){
    return res.json({
      'status': 403,
      'message': 'Forbidden'
    })
  }
  let user = await models.User.findOne({"username": authCred.username});
  if(user){
    if(authCred['authToken'] == user.authToken){
      next()
    } else {
      return res.json({
        'error': {
          'status': 403,
          'message': 'Forbidden'
        }
      })
    }
  } else {
    return res.json({
      'error': {
        'status': 403,
        "message": 'Forbidden'
      }
    })
  }
}

router.post('/signup', async (req, res, next) => {
  let username = req.body['username']
  let password = req.body['password']
  let sessionToken = generateToken(username)
  
  let user = new models.User({
    'username': username,
    'password': password,
    'authToken': sessionToken
  })

  try{
    await user.save()
  }catch(e) {
    next(e)
  }

  console.log(sessionToken)
  return res.json({
    'status': 200,
    'message': "Success",
    'authToken': sessionToken
  })
})

router.post('/signin', async (req, res, next) => {
  console.log("SignIn Called ....")
  username = req.body.username
  password = req.body.password
  let user = null
  try{
    user = await models.User.findOne({'username': username})    
    if(user.password == password){
      return res.json({
        'status': 200,
        'message': "Authentication Successful",
        'authToken': user.authToken
      })
    } else {
      return res.json({
        'error': {
          'status': 404,
          'message': 'Not Found'
        }
      })
    }
  } catch(e) {
    next(e)
  }
})

/* GET users listing. */
router.get('/', (req, res, next) => checkAuthInfo(req, res, next), async function(req, res, next) {
  let user = null;
  try{
    user = await models.User.findOne({'username': req.body.user.username}).select({'username': 1})
  } catch(e) {
    next(e)
  }
  return res.json({
    status: '200',
    message: 'User found',
    data: user
  })
});

module.exports = router;
