const companyRepository = require('../repositories/companyRepository');
const projectRepository = require('../repositories/projectRepository');
const taskRepository = require('../repositories/taskRepository');
const timeEntryRepository = require('../repositories/timeEntryRepository');

const getCompanies = async (req, res) => {
  const companies = await companyRepository.find({ user: req.user._id });
  res.json(companies);
};

const createCompany = async (req, res) => {
  const company = await companyRepository.create({ ...req.body, user: req.user._id });
  res.status(201).json(company);
};

const getProjects = async (req, res) => {
  const projects = await projectRepository.find({ user: req.user._id }).populate('company');
  res.json(projects);
};

const createProject = async (req, res) => {
  const project = await projectRepository.create({ ...req.body, user: req.user._id });
  res.status(201).json(project);
};

const getTasks = async (req, res) => {
  const tasks = await taskRepository.find({ user: req.user._id }).populate('project');
  res.json(tasks);
};

const createTask = async (req, res) => {
  const task = await taskRepository.create({ ...req.body, user: req.user._id });
  res.status(201).json(task);
};

const getTimeEntries = async (req, res) => {
  const entries = await timeEntryRepository.findByUserAndDateRange(
    req.user._id, 
    req.query.startDate, 
    req.query.endDate
  );
  res.json(entries);
};

const createTimeEntry = async (req, res) => {
  const entry = await timeEntryRepository.create({ ...req.body, user: req.user._id });
  res.status(201).json(entry);
};

const updateTimeEntry = async (req, res) => {
  const entry = await timeEntryRepository.update(req.params.id, req.body);
  res.json(entry);
};

module.exports = {
  getCompanies, createCompany,
  getProjects, createProject,
  getTasks, createTask,
  getTimeEntries, createTimeEntry, updateTimeEntry
};
