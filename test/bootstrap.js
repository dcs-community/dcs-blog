/* eslint-disable */
const Strapi = require('strapi');

const dropDB = require('./helpers/dropDB');

before(async function () {
  this.timeout(10000);
  await Strapi().start();

  // Add administration secret
  strapi.config.server.admin.auth.secret = 'test-admin';

  // create initial admin by default
  strapi.admin.models.user.create({
    blocked: false,
    username: "admin-test",
    password: "$2a$10$2c6VeLadgXmRk/CVqVs2h.GOl9llW46uCes0pMBR.Q55/r5HnZL0.",
    email: "guille@a.cu"
  });
});

after(async () => {
  await dropDB(strapi);
  await strapi.stop(0);
});
