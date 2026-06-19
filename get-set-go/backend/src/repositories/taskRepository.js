const Task = require('../models/Task');
const BaseRepository = require('./BaseRepository');

class TaskRepository extends BaseRepository {
  constructor() {
    super(Task);
  }
}
module.exports = new TaskRepository();
