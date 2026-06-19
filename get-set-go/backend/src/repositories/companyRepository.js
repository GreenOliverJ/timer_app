const Company = require('../models/Company');
const BaseRepository = require('./BaseRepository');

class CompanyRepository extends BaseRepository {
  constructor() {
    super(Company);
  }
}
module.exports = new CompanyRepository();
