var express = require('express');
var router = express.Router();
var models = require('../models/models')
var crypto = require('crypto')

let generateToken = (username) => {
  var random = Math.random().toString()
  return crypto.createHash('sha1').update(username + random).digest('hex')
}

let getPasswordHash = (password, salt) => {
  let fString = salt + "" + password
  return crypto.createHash('sha1').update(fString).digest('hex')
}

let randomSaltString = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
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
  
  let saltString = randomSaltString()
  let hashPassword = getPasswordHash(password, saltString)
  console.log(hashPassword)
  let user = new models.User({
    'username': username,
    'password': hashPassword,
    'authToken': sessionToken,
    'saltString': saltString
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
  console.log("Enter try block ....")
  try{
    user = await models.User.findOne({'username': username})
    let hashPassword = getPasswordHash(password, user.saltString)
    if(user.password == hashPassword){
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
