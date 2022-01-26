const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  
  authMiddleware: function ({ req }) {
    // allows token to be sent via  req.query or headers
    const token = req.headers.authorization.split(' ').pop().trim();;
    // console.log(req.headers)
    // // ["Bearer", "<tokenvalue>"]
    // if (req.headers.authorization) {
    //   token = token.split(' ').pop().trim();
    // }
    // console.log('2',token)
    if (!token) {
      return {user: null};
    }

    // verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      return {user: data};
    } catch(error) {
      console.log('Invalid token', error);
      return {user: null}
    }

    
    //return {user: null};
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
