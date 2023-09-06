const fs = require('fs').promises;
const { Octokit } = require("octokit");
const { Base64 } = require("js-base64");
const path = require('path')
const glob = require('globby')

class GitManager {

  constructor(org, repo, branch, local_path, author_name, author_email) {
    this.org = org
    this.repo = repo
    this.branch = branch
    this.local_path = local_path;
    this.author_name = author_name
    this.author_email = author_email
    this.octokit = new Octokit({ auth: process.env["GITHUB_PERSONAL_ACCESS_TOKEN"] });
  }


  async pushChanges(message) {
    console.log(`[GitManager] Starting pushChanges`)
    try {
      // 0. Build the list of files to sync
      await this.setPathList()
      // 1. Fetch the last commit's tree and store it's SHA
      const currentCommit = await this.getCurrentCommit()
      // 2. Create an array with the contents for each file as a String
      const fileStrings = await this.createContentStringForFiles()
      // 3. Create new tree from the paths and their content strings; GitHub will create SHA's
      const newTree = await this.createNewTree(fileStrings, currentCommit.treeSha)
      // 4. Create a new commit with the SHA for the new tree
      const newCommit = await this.createNewCommit(message, newTree.sha, currentCommit.commitSha)
      // 5. Set the branch ref to the new commit
      const newHead = await this.setBranchToCommit(this.branch, newCommit.sha)
      console.log(`[GitManager] Commit pushed, sha: ${newHead.object.sha}`)
    } catch(e) {
      console.log(e)
    }
  }

  async pullChanges() {
    try {
      await this.getContent()
      const currentCommit = await this.getCurrentCommit()
      console.log(`[GitManager] Pulled, sha: ${currentCommit.treeSha}`)
      return currentCommit
    } catch (e) {
      console.log(e)
    }
  }

  // Recursively fetch the contents of a GH path
  async getContent(read_path='') {
    const content = await this._getContent(read_path)
    for (let blob of content) {
      if (blob.type == "dir") {
        fs.mkdir(`${this.local_path}/${blob.path}`, {recursive: true})
        await this.getContent(blob.path)
      } else {
        const file = await this._getContent(blob.path)
        let writePath = path.join(this.local_path, blob.path)
        await fs.writeFile(writePath, Buffer.from(file.content, 'base64').toString())
        .catch(e => console.log(e) )
      }
    }
  }

  // Fetch the contents of a GH path, non-recursive.
  // If the read_path is a directory, returns a shallow list of meta data
  // If the pead_path is a file, you'll receive a .content attribute with the Base64 contents of the file
  async _getContent(read_path='') {
    const { data: content } = await this.octokit.rest.repos.getContent({
      owner: this.org,
      repo: this.repo,
      path: read_path
    })
    return content
  }

  async setPathList() {
    // By default, hidden items will be ignored.
    this.filesPaths = await glob(this.local_path)

    // Add exceptions with care, e.g. .github/workflows
    let whitelist = await glob(path.join(this.local_path, '.github'), {dot: true} )
    this.filesPaths = this.filesPaths.concat(whitelist)
  }

  async getCurrentCommit() {
    const { data: refData } = await this.octokit.rest.git.getRef({
      owner: this.org,
      repo: this.repo,
      ref: `heads/${this.branch}`,
    })
    const commitSha = refData.object.sha
    const { data: commitData } = await this.octokit.rest.git.getCommit({
      owner: this.org,
      repo: this.repo,
      commit_sha: commitSha,
    })
    return {
      commitSha,
      treeSha: commitData.tree.sha,
    }
  }

  async createContentStringForFiles() {
    let fileStrings = []
    let index = 0
    for (let filePath of this.filesPaths) {
      fileStrings.push({ content: await fs.readFile(filePath, "utf-8") })
      index++
    }
    return fileStrings
  }

  async createNewTree(fileStrings, parentTreeSha) {
    const pathsForBlobs = this.filesPaths.map(fullPath => path.relative(this.local_path, fullPath))
    const tree = fileStrings.map(({ content }, index) => ({
      path: pathsForBlobs[index],
      mode: `100644`,
      type: `blob`,
      content,
    }))

    const { data } = await this.octokit.rest.git.createTree({
      owner: this.org,
      repo: this.repo,
      tree,
      base_tree: parentTreeSha,
    })
    return data
  }

  async createNewCommit(message, currentTreeSha, currentCommitSha) {
    let { data } = await this.octokit.rest.git.createCommit({
      owner: this.org,
      repo: this.repo,
      message,
      tree: currentTreeSha,
      parents: [currentCommitSha],
      committer: {
        name: `Trivial Bot`,
        email: "support@withtrivial.com",
      },
      author: {
        name: this.author_name,
        email: this.author_email
      }
    })
    return data
  }

  async setBranchToCommit(branch, commitSha) {
    let { data } = await this.octokit.rest.git.updateRef({
      owner: this.org,
      repo: this.repo,
      ref: `heads/${branch}`,
      sha: commitSha,
    })
    return data
  }

}

module.exports = GitManager