var express = require('express');
var router = express.Router();
var models = require('../models/models')
var mongoose = require('mongoose')
/* GET home page. */

// console.log(auth)

let checkAuthInfo = async (req, res, next) => {
  console.log("checking Auth Info...")
  console.log(req.body)
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

router.post("/", (req, res, next) => checkAuthInfo(req, res, next), async (req, res, next) => {
  console.log(req.body)
  var blog = new models.Blog({
    title: req.body['title'],
    author: req.body['author'],
    text: req.body['text'],
    type: req.body['type'],
    publishDate: req.body['publishDate'],
    backColor: req.body['backColor'],
    isPublished: false
  })
  console.log(blog)
  try{
    await blog.save()
    console.log('blog saved....')
    let doc = await models.Blog.findOne({title: req.body['title']})
    console.log('getting --- object')
    console.log(doc)  
    return res.json({
      "status": 200,
      'message': "saved",
      'data': doc
    })
  } catch (e){
    console.log('error')
    console.log(e)
    next(e)
  }
})

router.get('/:name', async (req, res, next) => {
  let blog = null;
  let name = req.params.name.split('-').join(' ')
  try{
    blog = await models.Blog.findOne({title: name})
  } catch(e) {
    next(e)
  }
  return res.json({
    'status': 200,
    'message': 'found',
    'data': blog
  })
})

router.get('/', async (req, res, next) => {
  let blogs = null;
  try{
    blogs = await models.Blog.find().sort("-publishDate").select({'title': 1, 'author': 1, publishDate: 1, 'backColor': 1, type: 1, isPublished: 1})
  } catch (e){
    next(e)
  }
  res.json({
    'status': 200,
    'hits': blogs
  })
});

router.post('/save', (req, res, next) => checkAuthInfo(req, res, next), async (req, res, next) => {
  console.log(req.body)
  try{
    await models.Blog.updateOne(
      {'_id': req.body['_id']},
      {$set:{
          title: req.body['title'],
          author: req.body['author'],
          text: req.body['text'],
          type: req.body['type'],
          publishDate: req.body['publishDate'],
          backColor: req.body['backColor'],
          isPublished: req.body['isPublished']
        }
      }
    )
  } catch (e) {
    next(e)
  }
  return res.json({
    "status": 200,
    'message': 'updated'
  })
})

router.post('/delete', (req, res, next) => checkAuthInfo(req, res, next), async (req, res, next) => {
  console.log(req.body)
  try{
    await models.Blog.deleteOne({"_id": req.body['_id']})
  } catch (e) {
    next(e)
  }
  return res.json({
    'status': 200,
    'message': 'deleted'
  })
})

module.exports = router;
