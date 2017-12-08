let httpRequest
const makeRequest = () => {
  document.body.setAttribute('class', 'loading')
  httpRequest = new XMLHttpRequest()
  if (!httpRequest) {
    console.log('Giving up :( Cannot create an XMLHTTP instance')
    return false
  }
  httpRequest.onreadystatechange = alertContents
  let userId = document.getElementById('userId').value
  httpRequest.open('GET', '/user?userId=' + userId, true)
  httpRequest.send()
}

const alertContents = () => {
  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200) {
      document.body.removeAttribute('class', 'loading')
      let data = JSON.parse(httpRequest.responseText)
      console.log(data)
      createReport(data)
    } else {
      console.log('There was a problem with request')
    }
  }
}

const createReport = ({data}) => {
  const markup = `<div class="report">
    <h3>${data.name}</h3>
    <div class="flex-container">
      ${createLinks('Commits', data.push)}
      ${createLinks('Issues', data.issues)}
      ${createLinks('Pull Requests', data.pullRequests)}
    </div>  
  </div>
  <hr>`
  let list = document.getElementById('list')
  list.innerHTML = markup + list.innerHTML
}
const createLinks = (name, data) => `
<div class="flex-child">
<h4>${name}</h4>
${data.length === 0
  ? `<p>Not found.</p>`
  : `<ul>
      ${data.map(({url, name}) => `
        <li>
          <a href="${url}">${name}</a>
        </li>`
        ).join(' ')
      }
    </ul>`
}
</div>`

document.getElementById('addUser').addEventListener('click', makeRequest)
