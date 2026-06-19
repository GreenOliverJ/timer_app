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

const deleteTimeEntry = async (req, res) => {
  await timeEntryRepository.delete(req.params.id);
  res.status(200).json({ message: 'Deleted' });
};

const deleteCompany = async (req, res) => {
  const companyId = req.params.id;
  const projects = await projectRepository.model.find({ company: companyId });
  const projectIds = projects.map(p => p._id);
  
  await taskRepository.model.deleteMany({ project: { $in: projectIds } });
  await projectRepository.model.deleteMany({ company: companyId });
  await companyRepository.delete(companyId);
  
  await timeEntryRepository.model.updateMany(
    { company: companyId },
    { $set: { company: null, project: null, task: null } }
  );
  
  res.status(200).json({ message: 'Deleted' });
};

const updateCompany = async (req, res) => {
  const company = await companyRepository.update(req.params.id, req.body);
  res.json(company);
};

const deleteProject = async (req, res) => {
  const projectId = req.params.id;
  await taskRepository.model.deleteMany({ project: projectId });
  await projectRepository.delete(projectId);
  
  await timeEntryRepository.model.updateMany(
    { project: projectId },
    { $set: { project: null, task: null } }
  );
  
  res.status(200).json({ message: 'Deleted' });
};

const updateProject = async (req, res) => {
  const project = await projectRepository.update(req.params.id, req.body);
  res.json(project);
};

const deleteTask = async (req, res) => {
  const taskId = req.params.id;
  await taskRepository.delete(taskId);
  
  await timeEntryRepository.model.updateMany(
    { task: taskId },
    { $set: { task: null } }
  );
  
  res.status(200).json({ message: 'Deleted' });
};

const updateTask = async (req, res) => {
  const task = await taskRepository.update(req.params.id, req.body);
  res.json(task);
};

module.exports = {
  getCompanies, createCompany, deleteCompany, updateCompany,
  getProjects, createProject, deleteProject, updateProject,
  getTasks, createTask, deleteTask, updateTask,
  getTimeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry
};
