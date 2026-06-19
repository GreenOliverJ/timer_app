const userRepository = require('../repositories/userRepository');
const generateToken = require('../utils/generateToken');

class AuthService {
  async registerUser(name, email, password) {
    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
      throw new Error('User already exists');
    }
    const user = await userRepository.create({ name, email, password });
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    };
  }

  async loginUser(email, password) {
    const user = await userRepository.findByEmail(email);
    if (user && (await user.matchPassword(password))) {
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      };
    } else {
      throw new Error('Invalid email or password');
    }
  }
}

module.exports = new AuthService();
