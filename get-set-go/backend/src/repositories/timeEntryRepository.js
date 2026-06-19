const TimeEntry = require('../models/TimeEntry');
const BaseRepository = require('./BaseRepository');

class TimeEntryRepository extends BaseRepository {
  constructor() {
    super(TimeEntry);
  }
  
  async findByUserAndDateRange(userId, startDate, endDate) {
    const query = { user: userId };
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }
    return await this.model.find(query).populate('company project task').sort({ startTime: -1 });
  }
}
module.exports = new TimeEntryRepository();
