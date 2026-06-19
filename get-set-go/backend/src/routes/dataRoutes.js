const express = require('express');
const { 
  getCompanies, createCompany, deleteCompany, updateCompany,
  getProjects, createProject, deleteProject, updateProject,
  getTasks, createTask, deleteTask, updateTask,
  getTimeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry 
} = require('../controllers/dataController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/companies').get(getCompanies).post(createCompany);
router.route('/companies/:id').put(updateCompany).delete(deleteCompany);

router.route('/projects').get(getProjects).post(createProject);
router.route('/projects/:id').put(updateProject).delete(deleteProject);

router.route('/tasks').get(getTasks).post(createTask);
router.route('/tasks/:id').put(updateTask).delete(deleteTask);

router.route('/time-entries').get(getTimeEntries).post(createTimeEntry);
router.route('/time-entries/:id').put(updateTimeEntry).delete(deleteTimeEntry);

module.exports = router;
