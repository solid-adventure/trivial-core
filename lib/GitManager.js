const { spawn } = require('child_process');
const fs = require('fs').promises;
const { Octokit, App } = require("octokit");

class GitManager {

	constructor(github_repo, local_path) {
		this.github_repo = github_repo;
		this.local_path = local_path;
		console.log('[GitManager] Initialized');
	}


}

module.exports = GitManager