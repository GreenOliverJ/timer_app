const express = require('express');
const { 
  getCompanies, createCompany, 
  getProjects, createProject, 
  getTasks, createTask, 
  getTimeEntries, createTimeEntry, updateTimeEntry 
} = require('../controllers/dataController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/companies').get(getCompanies).post(createCompany);
router.route('/projects').get(getProjects).post(createProject);
router.route('/tasks').get(getTasks).post(createTask);
router.route('/time-entries').get(getTimeEntries).post(createTimeEntry);
router.route('/time-entries/:id').put(updateTimeEntry);

module.exports = router;
