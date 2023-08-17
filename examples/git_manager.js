const GitManager = require('../lib/GitManager')

// Push changes to files in support/slug-example to github.com.

// You must create a personal access token on Github.com with access to this repo,
// and set an env var for GITHUB_PERSONAL_ACCESS_TOKEN with the value

// An easy way to pass the PAT during development against a test repo is by creating an alias
// alias ghdemo='GITHUB_PERSONAL_ACCESS_TOKEN=YOUR-TOKEN node examples/git_manager.js'

// And then call the alias:
// ghdemo

const org='solid-adventure'
const repo='slug-example'
const branch='main'
const local_path = 'examples/support/slug-example/'
const author_name = 'Test Suite'
const author_email = 'test@withtrivial.com'
const gitManager = new GitManager(org, repo, branch, local_path, author_name, author_email)
const message = `Example commit message`
gitManager.pushChanges(message)

