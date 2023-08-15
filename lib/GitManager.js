const fs = require('fs').promises;
const { Octokit } = require("octokit");
const { Base64 } = require("js-base64");
const path = require('path')
const glob = require('globby')

const octokit = new Octokit({ auth: process.env["GITHUB_PERSONAL_ACCESS_TOKEN"] });

class GitManager {

	constructor(org, repo, branch, local_path, author_name, author_email) {
		this.org = org
		this.repo = repo
		this.branch = branch
		this.local_path = local_path;
		this.author_name = author_name
		this.author_email = author_email
	}

	async pushChanges(message) {
		console.log(`[GitManager] Starting pushChanges`)
		try {
			// 1. Fetch the last commit's tree and store it's SHA
	  	const currentCommit = await this.getCurrentCommit()
	  	console.log(currentCommit)
			// 2. Create a blob (SHA) for each file
	  	const fileBlobs = await this.createBlobForFiles()
	  	console.log(fileBlobs)
			// 3. Create new tree from the new SHA's
			const newTree = await this.createNewTree(fileBlobs, currentCommit.treeSha)
			console.log(newTree)
			// 4. Create a new commit with the SHA for the new tree
		  const newCommit = await this.createNewCommit(message, newTree.sha, currentCommit.commitSha)
			console.log(newCommit)
			// 5. Set the branch ref to the new commit
			const newHead = await this.setBranchToCommit(this.branch, newCommit.sha)
			console.log(`[GitManager] Commit pushed, sha: ${newHead.object.sha}`)
		} catch(e) {
			console.log(e)
		}
	}

	async getCurrentCommit() {
	  const { data: refData } = await octokit.rest.git.getRef({
	    owner: this.org,
	    repo: this.repo,
	    ref: `heads/${this.branch}`,
	  })
	  const commitSha = refData.object.sha
	  const { data: commitData } = await octokit.rest.git.getCommit({
	    owner: this.org,
	    repo: this.repo,
	    commit_sha: commitSha,
	  })
	  return {
	    commitSha,
	    treeSha: commitData.tree.sha,
	  }
	}

	async createBlobForFiles() {
		console.log(`[createBlobForFiles]: start`)
		const filesPaths = await glob(this.local_path)
		console.log(`filesPaths: ${filesPaths}`)
		let fileBlobs = []
		let index = 0
		for (let filePath of filesPaths) {
			console.log(`[createBlobForFiles] ${index} of ${filesPaths.length}`)
			fileBlobs.push(await this.createBlobForFile(filePath))
			index++
		}
		return fileBlobs
	}

	async createBlobForFile(filePath) {
	  const content = await fs.readFile(filePath, "utf-8")
	  const blobData = await octokit.rest.git.createBlob({
	    owner: this.org,
	    repo: this.repo,
	    content,
	    encoding: 'utf-8',
	  })
	  return blobData.data
	}

	async createNewTree(fileblobs, parentTreeSha) {
	  const filesPaths = await glob(this.local_path)
	  const pathsForBlobs = filesPaths.map(fullPath => path.relative(this.local_path, fullPath))
	  const tree = fileblobs.map(({ sha }, index) => ({
	    path: pathsForBlobs[index],
	    mode: `100644`,
	    type: `blob`,
	    sha,
	  }))

	  const { data } = await octokit.rest.git.createTree({
	    owner: this.org,
	    repo: this.repo,
	    tree,
	    base_tree: parentTreeSha,
	  })
	  return data
	}

	async createNewCommit(message, currentTreeSha, currentCommitSha) {
		let { data } = await octokit.rest.git.createCommit({
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
	  let { data } = await octokit.rest.git.updateRef({
	    owner: this.org,
	    repo: this.repo,
	    ref: `heads/${branch}`,
	    sha: commitSha,
	  })
	  return data
	}

}

module.exports = GitManager