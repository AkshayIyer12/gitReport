const express = require('express')
const route = require('./routes')
const helper = require('./helper')
const path = require('path')
const app = express()

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render(path.join(__dirname, '..', 'views', 'home'))
})

app.get(route.getUser, (req, res) => {
  Promise.resolve(helper.getUserData(req.query.userId))
  .then(v => {
    if (v.message) throw Error(v.message)
    v.name = req.query.userId
    res.render(path.join(__dirname, '..', 'views', 'repos'), {
      user: v
    })
  }).catch(err => res.json({
    status: 'error',
    message: err.message
  }))
})

app.listen(3000, () => console.log('Starting server at 3000'))
