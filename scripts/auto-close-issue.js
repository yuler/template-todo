import {Octokit} from 'octokit'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN

// Issue title
const now = new Date()
const yyyy = now.getFullYear().toString()
const mm = (now.getMonth() + 1).toString().padStart(2, 0)
const dd = now.getDay().toString().padStart(2, 0)
const issueTitle = `${yyyy}-${mm}-${dd}`

// Query today issue
const octokit = new Octokit({auth: GITHUB_TOKEN, timeZone: 'Asia/Shanghai'})
const {
	data: {login: owner},
} = await octokit.rest.users.getAuthenticated()
const {
	data: {items},
} = await octokit.rest.search.issuesAndPullRequests({
	q: `${issueTitle} repo:${owner}/todo`,
})

// Empty
if (items.length === 0) {
	console.log('Empty!')
	return
}

const body = items[0].body
const lines = body.split(/\r\n?/)
const tasks = lines.filter(line => /-\s+\[(x| )\]/.test(line))
const done = tasks.every(task => /-\s+\[x\]/.test(task))
if (!done) {
	console.log('Today todo uncomplete!')
	return
}
await octokit.rest.issues.update({
	owner,
	repo: 'todo',
	issue_number: items[0].number,
	state: 'closed',
})
console.log("Auto close today's todo issue success.")
