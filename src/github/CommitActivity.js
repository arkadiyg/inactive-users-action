const util = require('../dateUtil');
const repoErrors = require('./repoErrors');

module.exports = class CommitActivity {

  constructor(octokit) {
    if (!octokit) {
      throw new Error('An octokit client must be provided');
    }
    this._octokit = octokit;
  }

  getCommitActivityFrom(owner, repo, since) {
    const from = util.getFromDate(since)
      , repoFullName = `${owner}/${repo}`
    ;

    return this.octokit.paginate('GET /repos/:owner/:repo/commits',
      {
        owner: owner,
        repo: repo,
        since: from,
        per_page: 100,
      }
    ).then(commits => {
      const committers = {};

      commits.forEach(commit => {
        if (commit.author && commit.author.login) {
          const login = commit.author.login;

          if (!committers[login]) {
            committers[login] = 1;
          } else {
            committers[login] = committers[login] + 1;
          }
        }
      });

      const result = {};
      result[repoFullName] = committers;

      return result;
    })
      .catch(err => {
        if (repoErrors.isNoActivityError(err)) {
          return {};
        }
        throw err;
      })
  }

  get octokit() {
    return this._octokit;
  }
}


