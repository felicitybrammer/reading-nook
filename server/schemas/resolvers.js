const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('savedBooks');

                return userData;
            }
            throw new AuthenticationError('Not logged in!');
        },
        user: async (parent, { username }) => {
            return User.findOne({ username })
                .select('-__v -password')
                .populate('savedBooks');
        },
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
      
            if (!user) {
              throw new AuthenticationError('Incorrect credentials');
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
      
            const token = signToken(user);
            return { token, user };
          },
        saveBook: async (parent, { user, savedBooks }, context) => {
            if (context.user) {
                const updatedBooks = await User.findOneAndUpdate(
                    { _id: user._id },
                    { $addToSet: { savedBooks, username: context.user.username } },
                    { new: true, runValidators: true }
                    //update bookCount
                );
                return updatedBooks;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (parent, { user, savedBooks }, context) => {
            const updatedBooks = await User.findOneAndUpdate(
                { _id: user._id },
                { $pull: { savedBooks: { bookId: context.book.bookId } } },
                { new: true }
            )
            return updatedBooks;
        
        },
  
    }
};

module.exports = resolvers;