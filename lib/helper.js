const gitApi = require('./externalApi')
const auth = require('./config')
const fetch = require('node-fetch')

const getUserData = userId => {
  return fetch(gitApi.getUserInfo + userId, auth)
    .then(val => val.json())
    .then(v => {
      if (v.message) throw Error(v.message)
      return v
    })
    .then(user => getEvents(user.events_url))
    .catch(err => err)
}

const getEvents = eventsUrl => {
  return fetchAll(eventsUrl)
    .then(repos => filterAll(repos))
    .then(filteredRepo => reduceToNameAndUrl(filteredRepo))
    .then(repo => objectToArray(repo))
    .catch(err => err.message)
}

const fetchAll = eventsUrl => Promise.all([1, 2, 3].map(v => fetch(eventsUrl.slice(0, eventsUrl.length - 10) + `?page=${v}&per_page=100`, auth).then(v => v.json())))

const filterByEvent = (r, event) => r.map(repos => repos.filter(v => v.type === event)).reduce((a, b) => a.concat(b), [])

const filterAll = repos => {
  let events = ['PushEvent', 'IssuesEvent', 'PullRequestEvent'].map(v => filterByEvent(repos, v))
  return {
    push: events[0],
    issues: events[1],
    pullRequest: events[2]
  }
}

const reduceToNameAndUrl = filteredRepo => {
  let ac = {}
  for (let key in filteredRepo) ac[key] = removeRedundancy(filteredRepo[key])
  return ac
}

const removeRedundancy = v => v.reduce((a, v) => {
  let repo = v.repo.name.split('/')[1]
  a[repo] = {
    name: v.payload.title || repo,
    url: (!!v.payload.pull_request && v.payload.pull_request.html_url) || (!!v.payload.issue && v.payload.issue.html_url) || v.payload.commits
  }
  return a
}, {})

const objectToArrayHelper = (repos) => {
  let arr = new Array(3), key
  for (key in repos) {
    if (key === 'push') arr[0] = giveCommitsLT5(giveMeAnArray(key, repos[key]))
    else if (key === 'issues') arr[1] = giveMeAnArray(key, repos[key])
    else arr[2] = giveMeAnArray(key, repos[key])
  }
  return arr
}
const objectToArray = repos => {
  let arr = objectToArrayHelper(repos)
  return {
    push: arr[0],
    issues: arr[1],
    pullRequests: arr[2]
  }
}

const giveMeAnArray = (key, repos) => {
  let arr = []
  for (r in repos) arr.push(repos[r])
  return arr
}

const giveCommitsLT5 = arr => arr.slice(0, 4)

module.exports = {
  getUserData
}
