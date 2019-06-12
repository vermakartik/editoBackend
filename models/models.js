const mongoose =  require('mongoose')

let BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true 
    },
    author: String,
    text: String, 
    type: String,
    backColor: String, 
    publishDate: String,
})

let AuthSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    password: String,
    authToken: String,
})

module.exports.Blog = mongoose.model('Blog', BlogSchema)
module.exports.User = mongoose.model("Auth", AuthSchema)

