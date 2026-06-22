const { expect } = require('chai');
const repoErrors = require('./repoErrors');

describe('repoErrors', () => {
  describe('isNoActivityError()', () => {
    it('treats a 404 as no activity', () => {
      expect(repoErrors.isNoActivityError({ status: 404, message: 'Not Found' })).to.be.true;
    });

    it('treats a 409 as no activity', () => {
      expect(repoErrors.isNoActivityError({ status: 409, message: 'Git Repository is empty.' })).to.be.true;
    });

    it('matches the empty-repo message even when the status is missing', () => {
      // The retry/throttling plugins do not always preserve err.status, so the
      // message must be enough on its own.
      expect(repoErrors.isNoActivityError({ message: 'Git Repository is empty.' })).to.be.true;
    });

    it('is case-insensitive on the empty-repo message', () => {
      expect(repoErrors.isNoActivityError({ message: 'GIT REPOSITORY IS EMPTY.' })).to.be.true;
    });

    it('rethrows other errors', () => {
      expect(repoErrors.isNoActivityError({ status: 500, message: 'Server Error' })).to.be.false;
      expect(repoErrors.isNoActivityError(null)).to.be.false;
      expect(repoErrors.isNoActivityError({})).to.be.false;
    });
  });
});
