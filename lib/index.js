const express = require('express')
const route = require('./routes')
const gitApi = require('./externalApi')
const auth = require('./config')
const path = require('path')
const fetch = require('node-fetch')
const app = express()

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')))

app.get(route.getUser, (req, res) => {
  fetch(gitApi.getUserInfo + req.query.userId, {header: auth})
  .then(val => val.json())
  .then(user => {
    fetch(user.repos_url, {header: auth})
    .then(val => val.json())
    .then(repos => repos.map(v => v.name))
    .then(data => res.send(`<p>${data}</p>`))
  })
  .catch(err => res.json({status: 'error', message: err.message}))
})

app.listen(3000, () => console.log('Starting server at 3000'))
