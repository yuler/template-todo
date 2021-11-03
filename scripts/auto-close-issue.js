import {Octokit} from 'octokit'
import {sub, format} from 'date-fns'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN

// Issue title for yesterday
const yesterday = sub(new Date(), {days: 1})
const issueTitle = format(yesterday, 'yyyy-MM-dd')

console.log(`Issue title: ${issueTitle}`)

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
	process.exit(0)
}

const body = items[0].body
const lines = body.split(/\r\n?/)
const tasks = lines.filter(line => /-\s+\[(x| )\]/.test(line))
const done = tasks.every(task => /-\s+\[x\]/.test(task))
if (!done) {
	console.log('Today todo uncomplete!')
	process.exit(0)
}
await octokit.rest.issues.update({
	owner,
	repo: 'todo',
	issue_number: items[0].number,
	state: 'closed',
})
console.log("Auto close today's todo issue success.")
