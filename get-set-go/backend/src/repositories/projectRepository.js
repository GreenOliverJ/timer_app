const Project = require('../models/Project');
const BaseRepository = require('./BaseRepository');

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }
}
module.exports = new ProjectRepository();
