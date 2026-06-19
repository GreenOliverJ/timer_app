const User = require('../models/User');
const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }
  async findByEmail(email) {
    return await this.model.findOne({ email });
  }
}

module.exports = new UserRepository();
