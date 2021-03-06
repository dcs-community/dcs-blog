const chai = require('chai');
const chaiHttp = require('chai-http');

const randomName = require('../../helpers/random-name');
const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);
const expect = chai.expect;

const MUTATION_CREATE_COMMENT = {
  operationName: null,
  // language=GraphQL
  query: 'mutation create(\n  $body: String\n  $post: ID\n) {\n  createComment(input: {data: {body: $body, post: $post}}){\n    comment {\n      id\n      body\n      publishedAt\n      name\n      user {\n        username\n        avatar {\n          url\n        }\n      }\n    }\n  }\n}'
};

describe('Update comments count in post INTEGRATION', () => {
  let user;
  let post;

  before(async () => {
    user = await createUser({strapi, roleType: 'administrator'});
    post = await createPost(strapi, {author: user});
  });

  it('should increment the count of comments in the post', async () => {
    const jwt = generateJwt(strapi, user);

    for (let i = 0; i < 10; i++) {
      await new Promise((resolve, reject) => {
        chai.request(strapi.server)
          .post('/graphql')
          .set('Authorization', `Bearer ${jwt}`)
          .send({...MUTATION_CREATE_COMMENT, variables: {body: randomName(100), post: post.id}})
          .end((err, res) => err ? reject(err) : resolve(res));
      });
      post = await strapi.models.post.findOne({_id: post._id});
      expect(post.comments.toNumber()).to.be.equal(i + 1);
    }
  });
});
