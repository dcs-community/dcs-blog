'use strict';

const crypto = require('crypto');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  createCaptchaJwt(text, key) {
    const head = Buffer.from(JSON.stringify({alg: 'HS256', typ: 'JWT'})).toString('base64');
    const body = Buffer.from(JSON.stringify({
      hash: this.createHash(text.toLowerCase(), key),
      exp: new Date().getTime() + 180000
    })).toString('base64');
    const sign = this.createHash(`${head}.${body}`, key);
    return `${head}.${body}.${sign}`;
  },

  checkCaptchaJwt(jwt, text, key) {
    const splitJwt = jwt.split('.');
    if (splitJwt.length === 3) {
      try {
        if (this.createHash(`${splitJwt[0]}.${splitJwt[1]}`, key) === splitJwt[2]) {
          const body = JSON.parse(Buffer.from(splitJwt[1], 'base64').toString());
          if (parseInt(body.exp) > new Date().getTime()) {
            return body.hash === this.createHash(text.toLowerCase(), key);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
    return false;
  },

  createHash(text, key) {
    return crypto.createHmac('sha256', key).update(text).digest('base64');
  },

  async recentComments(limit = 8) {
    // todo: this should be optimized for when the application is big enough to make this query to slow
    const comments = await strapi.models.comment
      .find()
      .populate(['post', 'user'])
      .sort({createdAt: 'desc'})
      .limit(limit);
    return comments.filter(comment => {
      return strapi.services.post.isPublish(comment.post);
    });
  }
};
