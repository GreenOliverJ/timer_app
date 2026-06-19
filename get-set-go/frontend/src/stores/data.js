import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

export const useDataStore = defineStore('data', {
  state: () => ({
    companies: [],
    projects: [],
    tasks: [],
    timeEntries: []
  }),
  actions: {
    getHeaders() {
      const auth = useAuthStore();
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      };
    },
    async fetchAll() {
      await Promise.all([
        this.fetchCompanies(),
        this.fetchProjects(),
        this.fetchTasks(),
        this.fetchTimeEntries()
      ]);
    },
    async fetchCompanies() {
      const res = await fetch('/api/data/companies', { headers: this.getHeaders() });
      if (res.ok) this.companies = await res.json();
    },
    async fetchProjects() {
      const res = await fetch('/api/data/projects', { headers: this.getHeaders() });
      if (res.ok) this.projects = await res.json();
    },
    async fetchTasks() {
      const res = await fetch('/api/data/tasks', { headers: this.getHeaders() });
      if (res.ok) this.tasks = await res.json();
    },
    async fetchTimeEntries(startDate, endDate) {
      let url = '/api/data/time-entries';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { headers: this.getHeaders() });
      if (res.ok) this.timeEntries = await res.json();
    },
    async addCompany(name) {
      const res = await fetch('/api/data/companies', {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify({ name })
      });
      if (res.ok) {
        const data = await res.json();
        this.companies.push(data);
        return data;
      }
    },
    async addProject(name, hourlyRate, companyId) {
      const res = await fetch('/api/data/projects', {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify({ name, hourlyRate, company: companyId })
      });
      if (res.ok) {
        const data = await res.json();
        await this.fetchProjects(); // refresh populate
        return data;
      }
    },
    async addTask(name, projectId) {
      const res = await fetch('/api/data/tasks', {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify({ name, project: projectId })
      });
      if (res.ok) {
        const data = await res.json();
        await this.fetchTasks();
        return data;
      }
    },
    async addTimeEntry(entry) {
      const res = await fetch('/api/data/time-entries', {
        method: 'POST', headers: this.getHeaders(), body: JSON.stringify(entry)
      });
      if (res.ok) {
        await this.fetchTimeEntries();
      }
    }
  }
});
