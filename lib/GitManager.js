const fs = require('fs').promises;
const { Octokit } = require("octokit");
const { Base64 } = require("js-base64");
const path = require('path')
const glob = require('globby')

const octokit = new Octokit({ auth: process.env["GITHUB_PERSONAL_ACCESS_TOKEN"] });

class GitManager {

	constructor(org, repo, branch, local_path) {
		this.org = org
		this.repo = repo
		this.branch = branch
		this.local_path = local_path;
	}

	async pushDirectory() {
		try {
			// 1. Fetch the last commit's tree and store it's SHA
	  	const currentCommit = await this.getCurrentCommit()
	  	console.log(this.currentCommit)

			// 2. Create a blob (SHA) for each file
	  	const fileBlobs = await this.createBlobForFiles()
			console.log(fileBlobs)

			// 3. Create new tree from the new SHA's
			const newTree = await this.createNewTree(fileBlobs, currentCommit.treeSha)
			console.log(newTree)

			// 4. Create a new commit with the SHA for the new tree
			// TODO

			// 5. Set the branch ref to the new commit
			// TODO

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
		const filesPaths = await glob(this.local_path)
		let fileBlobs = []
		for (let filePath of filesPaths) {
			fileBlobs.push(await this.createBlobForFile(filePath))
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

	async pushSample() {
    try {

      const content = await fs.readFile(this.local_path, "utf-8");
      const contentEncoded = Base64.encode(content);

      const {data} = await octokit.rest.repos.createOrUpdateFileContents({
        owner: this.org,
        repo: this.repo,
        path: "sample.txt",
        message: "Added sample.txt programatically",
        content: contentEncoded,
        committer: {
          name: `Trivial JS Bot`,
          email: "support@withtrivial.com",
        },
        author: {
          name: "James Marks",
          email: "james.marks@withtrivial.com",
        },
      });
      console.log(data);
    } catch (err) {
      console.error(err);
    }
	}

	async printAuthedUser() {
		const {
		  data: { login },
		} = await octokit.rest.users.getAuthenticated();
		console.log("Hello, %s", login)
	}


}

module.exports = GitManager