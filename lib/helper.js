const gitApi = require('./externalApi')
const auth = require('./config')
const fetch = require('node-fetch')

const getUserData = userId => {
  return fetch(gitApi.getUserInfo + userId, auth)
    .then(val => val.json())
    .then(user => getEvents(user.events_url))
    .catch(err => err.message)
}

const getEvents = eventsUrl => {
  return fetchAll(eventsUrl)
    .then(repos => filterAll(repos))
    .then(filteredRepo => reduceToNameAndUrl(filteredRepo))
    .then(repo => objectToArray(repo))
    .catch(err => err.message)
}

const fetchAll = eventsUrl => {
  let url = eventsUrl.slice(0, eventsUrl.length - 10) 
  let p = Promise.all([
    fetch(url + '?page=1&per_page=100', auth).then(v => v.json()),
    fetch(url + '?page=2&per_page=100', auth).then(v => v.json()),
    fetch(url + '?page=3&per_page=100', auth).then(v => v.json())
  ])
  return p
}

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
  for (let key in filteredRepo) {
    ac[key] = filteredRepo[key].reduce((a, v) => {
      let repo = v.repo.name.split('/')[1]
      a[repo] = {
        name: repo,
        url: v.repo.url
      }
      return a
    }, {})
  }
  return ac
}

const objectToArray = repos => {
  let pushArr, issueArr, pullRequestArr
  for (key in repos) {
    if (key === 'push') {
      pushArr = giveCommitsLT5(giveMeAnArray(key, repos[key]))
    } else if (key === 'issues') issueArr = giveMeAnArray(key, repos[key])
    else pullRequestArr = giveMeAnArray(key, repos[key])
  }
  return {
    push: pushArr,
    issues: issueArr,
    pullRequests: pullRequestArr
  }
}

const giveMeAnArray = (key, repos) => {
  let arr = []
  if (repos.length === 0) return arr
  for (repoNames in repos) arr.push(repos[repoNames])
  return arr
}

const giveCommitsLT5 = arr => {
  if (arr.length < 4) return arr
  else return arr.slice(0, 4)
}

module.exports = {
  getUserData
}
