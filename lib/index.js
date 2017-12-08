const express = require('express')
const route = require('./routes')
const helper = require('./helper')
const path = require('path')
const app = express()

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'repos.html'))
})

app.get(route.getUser, (req, res) => {
  helper.getUserData(req.query.userId)
  .then(v => {
    if (v.message) throw Error(v.message)
    v.name = req.query.userId
    res.json({
      status: 'success',
      data: v
    })
  })
  .catch(err => res.json({
    status: 'error',
    message: err.message
  }))
})

app.listen(3000, () => console.log('Starting server at 3000'))
