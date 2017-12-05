const express = require('express')
const route = require('./routes')
const gitApi = require('./externalApi')
const auth = require('./config')
const path = require('path')
const fetch = require('node-fetch')
const app = express()

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render(path.join(__dirname, '..', 'views', 'home'))
})

app.get(route.getUser, (req, res) => {
  fetch(gitApi.getUserInfo + req.query.userId, auth)
    .then(val => val.json())
    .then(user => {
      fetch(user.events_url.slice(0, user.events_url.length - 10), auth)
        .then(val => val.json())
        .then(repos => {
          return repos.filter(v => {
            if (v.type === 'PushEvent') return v
          })
        })
        .then(vf => vf.reduce((a, v) => {
          let repo = v.repo.name.split('/')[1]
          a[repo] = {
            name: repo,
            url: v.repo.url
          }
          return a
        }, {}))
        .then(repo => {
          let arr = []
          for (key in repo) {
            if (arr.length < 4) arr.push(repo[key])
          }
          return arr
        })
        .then(user => {
          user.name = req.query.userId
          res.render(path.join(__dirname, '..', 'views', 'repos'), {
            user: user
          })
        })
        .catch(err => res.json({
          status: 'error',
          message: err.message
        }))
    })
    .catch(err => res.json({
      status: 'error',
      message: err.message
    }))
})

app.listen(3000, () => console.log('Starting server at 3000'))
