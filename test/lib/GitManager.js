const chai = require('chai')
const expect = chai.expect
const fs = require('fs').promises
const path = require('path')
const GitManager = require('../../lib/GitManager')

const gitAttrs = {
  org: 'solid-adventure',
  repo: 'slug-example',
  branch: 'main',
  local_path: 'tmp/slug-example',
  author_name: 'Test Suite',
  author_email: 'test@withtrivial.com'
}
const gitManager = new GitManager(...Object.values(gitAttrs))

describe("GitManager", () => {

  it('should initialize', () => {
    expect(gitManager).to.be.instanceOf(GitManager)
    expect(gitManager.local_path).to.eql(gitAttrs.local_path)
  })

  it('should set the path list', async () => {
    expect(gitManager.filesPaths).to.be.undefined
    await gitManager.setPathList()
    expect(gitManager.filesPaths).not.to.be.undefined
  })

  it ('should add paths in the local path, including whitelisted hidden files', async () => {
    await gitManager.setPathList()
    expect(gitManager.filesPaths).to.eql([
      'tmp/slug-example/temp.txt',
      'tmp/slug-example/.github/workflows/ci.yml'
    ])
  })

  it ('should not send unwhitelisted hidden files', async () => {
    await gitManager.setPathList()
    expect(gitManager.filesPaths).not.to.include('tmp/slug-example/.env')
  })

  it('should return the git url', () => {
    const ref = gitManager.octokit.rest.git.getRef()
    let url = `https://api.github.com/repos/${gitAttrs.org}/${gitAttrs.repo}/git/refs/heads/${gitAttrs.branch}`
    expect(ref.data.url).to.eql(url)
  })

  it('should fetch the current commit tree', async () => {
    const currentCommit = await gitManager.getCurrentCommit()
    expect(currentCommit.treeSha).to.eql('mocktreesha')
  })

  it('creates a new tree', async () => {
    const fileStrings = await gitManager.createContentStringForFiles()
    const newTree = await gitManager.createNewTree(fileStrings, 'mocktreesha')
    expect(newTree.sha).to.eql('newTreeMockSha')
  })

  it('should return the current head from a pull', async () => {
    const currentCommit = await gitManager.pullChanges()
    expect(currentCommit.treeSha).to.eql('mocktreesha')
  })

})

after( () => {
  fs.rm(gitAttrs.local_path, {recursive: true})
})

before( async ()=> {
  await fs.mkdir(path.join(gitAttrs.local_path, '.github', 'workflows'), {recursive: true})
  fs.writeFile(path.join(gitAttrs.local_path, 'temp.txt'), "test file contents")
  fs.writeFile(path.join(gitAttrs.local_path, '.env'), "hidden file")
  fs.writeFile(path.join(gitAttrs.local_path, '.github', 'workflows','ci.yml'), "hidden github config")

  gitManager.octokit = {
    rest: {
      repos: {
        getContent: () => {
          return {
            data: []
          }
        }
      },
      git: {
        getRef: () => {
          return { 
            data: {
              "ref": `refs/heads/${gitAttrs.branch}`,
              "node_id": "TEST",
              "url": `https://api.github.com/repos/${gitAttrs.org}/${gitAttrs.repo}/git/refs/heads/${gitAttrs.branch}`,
              "object": {
                "sha": "mocksha",
                "type": "commit",
                "url": ""
              }
            }
          }
        },

        getCommit: () => {
          return {
            data: 
             {
                "sha": "",
                "node_id": "",
                "url": "",
                "html_url": "",
                "author": {
                  "name": gitAttrs.author_name,
                  "email": gitAttrs.author_email,
                  "date": "2023-08-17T21:54:58Z"
                },
                "committer": {
                  "name": "Trivial Bot",
                  "email": "support@withtrivial.com",
                  "date": "2023-08-17T21:54:58Z"
                },
                "tree": {
                  "sha": "mocktreesha",
                  "url": ""
                },
                "message": "Example commit message",
                "parents": [
                  {
                    "sha": "mocksha",
                    "url": "",
                    "html_url": ""
                  }
                ],
                "verification": {
                  "verified": false,
                  "reason": "unsigned",
                  "signature": null,
                  "payload": null
                }
              }
            }
        },

        createTree: () => {
          return {
            data: {
              "sha": "newTreeMockSha",
              "url": "",
              "tree": [
                {
                  "path": ".github",
                  "mode": "040000",
                  "type": "tree",
                  "sha": "mockblobsha",
                  "url": ""
                }]
              }
          }        
        }
      }
    }
  }

})