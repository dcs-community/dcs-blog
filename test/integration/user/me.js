const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_MY_USER = {
  operationName: null,
  query: 'query{\n  myData{\n    id\n    username\n    email\n    page\n    avatarUrl\n    role { name type }\n  }\n}'
};

describe('Get me user INTEGRATION', () => {

  before(async () => {
  });

  it('should get my user data', async () => {
    const provider = await strapi.models.provider.create({provider: 'github'});
    let user = await createUser({strapi, provider});

    const jwt = generateJwt(strapi, user);
    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(QUERY_MY_USER)
      .end((err, res) => err ? reject(err) : resolve(res)));

    expect(!!res.body.data.myData).to.be.true;
  });
});
