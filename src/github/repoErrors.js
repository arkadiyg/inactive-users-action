// Helpers for recognising repository errors that should be treated as
// "no activity" rather than aborting the whole organization report.

// An empty repository (no commits) makes the commits/issues/pulls endpoints
// respond with HTTP 409 "Git Repository is empty.". Depending on how the
// error propagates through octokit's retry/throttling plugins the numeric
// status is not always preserved, so match on the message as well.
function isEmptyRepo(err) {
  if (!err) {
    return false;
  }

  if (err.status === 409) {
    return true;
  }

  const message = (err.message || '').toString().toLowerCase();
  return message.includes('git repository is empty');
}

// A missing/inaccessible repository responds with 404; treat it as no activity.
function isMissingRepo(err) {
  return !!err && err.status === 404;
}

// True when the error means there is simply nothing to report for the repo.
function isNoActivityError(err) {
  return isMissingRepo(err) || isEmptyRepo(err);
}

module.exports = {
  isEmptyRepo,
  isMissingRepo,
  isNoActivityError,
};
