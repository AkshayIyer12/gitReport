const gitApi = require('./externalApi')
const auth = require('./config')
const fetch = require('node-fetch')

function getUserData (userId) {
  return fetch(gitApi.getUserInfo + userId, auth)
          .then(val => val.json())
          .then(user => getEvents(user.events_url))
          .catch(err => err.message)
}
function getEvents (eventsUrl) {
  return fetch(eventsUrl.slice(0, eventsUrl.length - 10), auth)
          .then(val => val.json())
          .then(repos => filterByPush(repos))
          .then(filteredRepo => reduceToNameAndUrl(filteredRepo))
          .then(repo => shortenRepoCount(repo))
          .catch(err => err.message)
}
function filterByPush (repos) {
  return repos.filter(v => {
    if (v.type === 'PushEvent') return v
  })
}
function reduceToNameAndUrl (filteredRepo) {
  return filteredRepo.reduce((a, v) => {
    let repo = v.repo.name.split('/')[1]
    a[repo] = {
      name: repo,
      url: v.repo.url
    }
    return a
  }, {})
}
function shortenRepoCount (repo) {
  let arr = []
  for (key in repo) {
    if (arr.length < 4) arr.push(repo[key])
  }
  return arr
}
module.exports = {
  getUserData
}
