const chai = require('chai')
const expect = chai.expect
const fs = require('fs').promises
// const sinon = require('sinon')
// const match = sinon.match
const GitManager = require('../../lib/GitManager')
// chai.use(require('sinon-chai'))

describe("GitManager", () => {

  describe('initializes repo', () => {

    let github_repo = 'https://github.com/solid-adventure/slug-example.git'
    let local_path = 'support/slug-example'
    let gitManager = new GitManager(github_repo, local_path)

  })


})
