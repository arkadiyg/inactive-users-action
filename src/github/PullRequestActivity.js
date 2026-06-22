const util = require('../dateUtil');
const repoErrors = require('./repoErrors');

module.exports = class PullRequestActivity {

  constructor(octokit) {
    if (!octokit) {
      throw new Error('An octokit client must be provided');
    }
    this._octokit = octokit;
  }

  getPullRequestCommentActivityFrom(owner, repo, since) {
    const from = util.getFromDate(since)
      , repoFullName = `${owner}/${repo}`
    ;

    return this.octokit.paginate('GET /repos/:owner/:repo/pulls/comments',
      {
        owner: owner,
        repo: repo,
        since: from,
        per_page: 100,
      }
    ).then(prComments => {
      const users = {};

      prComments.forEach(prComment => {
        if (prComment.user && prComment.user.login) {
          const login = prComment.user.login;

          if (!users[login]) {
            users[login] = 1;
          } else {
            users[login] = users[login] + 1;
          }
        }
      });

      const result = {};
      result[repoFullName] = users;

      return result;
    })
      .catch(err => {
        if (repoErrors.isNoActivityError(err)) {
          return {};
        }
        console.error(err)
        throw err;
      })
  }

  get octokit() {
    return this._octokit;
  }
}


