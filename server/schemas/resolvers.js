const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      return User.find()
        .select('-__v -password')
        .populate('Books')
    },
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('savedBooks');

        return userData;
      }

      throw new AuthenticationError('Not logged in');
    }
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
    saveBook: async (parent, {bookId, authors, description, title, image, link}, context) => {
      /* if (context.user) { */
        console.log(authors)
        const updatedUser = await User.findOneAndUpdate(
          { _id: /* context.user._id */ "604ef7330cbe233330401437" },
          { $push: { savedBooks: { bookId: bookId, authors: authors, description: description, title: title, image: image, link: link  } } },
          { new: true, runValidators: true }
        );

        return updatedUser;
      /* }

      throw new AuthenticationError('You need to be logged in!'); */
    },
    removeBook: async (parent, {bookId}, context) => {
      /* if (context.user) { */
        const updatedUser = await User.findOneAndUpdate(
          { _id: /* context.user._id */ "604ef7330cbe233330401437" },
          { $pull: { savedBooks: { bookId: bookId} } },
          { new: true }
        );

        return updatedUser;
      /* }

      throw new AuthenticationError('You need to be logged in!'); */
    }
  }
};

module.exports = resolvers;
