<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Settings</div>
    <div class="row q-col-gutter-md">
      <!-- Companies -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Companies</div>
          </q-card-section>
          <q-list separator>
            <q-item v-for="company in dataStore.companies" :key="company._id">
              <q-item-section>{{ company.name }}</q-item-section>
              <q-item-section side>
                <div class="row q-gutter-x-sm">
                  <q-btn flat round dense icon="edit" color="primary" @click="editCompany(company)" />
                  <q-btn flat round dense icon="delete" color="negative" @click="promptDeleteCompany(company._id)" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Projects -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Projects</div>
          </q-card-section>
          <q-list separator>
            <q-item v-for="project in dataStore.projects" :key="project._id">
              <q-item-section>
                <q-item-label>{{ project.name }}</q-item-label>
                <q-item-label caption>{{ project.company?.name }} • €{{ project.hourlyRate }}/hr</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row q-gutter-x-sm">
                  <q-btn flat round dense icon="edit" color="primary" @click="editProject(project)" />
                  <q-btn flat round dense icon="delete" color="negative" @click="promptDeleteProject(project._id)" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Tasks -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Tasks</div>
          </q-card-section>
          <q-list separator>
            <q-item v-for="task in dataStore.tasks" :key="task._id">
              <q-item-section>
                <q-item-label>{{ task.name }}</q-item-label>
                <q-item-label caption>{{ task.project?.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row q-gutter-x-sm">
                  <q-btn flat round dense icon="edit" color="primary" @click="editTask(task)" />
                  <q-btn flat round dense icon="delete" color="negative" @click="promptDeleteTask(task._id)" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useDataStore } from '../stores/data';
import { useQuasar } from 'quasar';

const dataStore = useDataStore();
const $q = useQuasar();

onMounted(() => {
  dataStore.fetchAll();
});

const editCompany = (company) => {
  $q.dialog({
    title: 'Edit Company',
    prompt: { model: company.name, type: 'text' },
    cancel: true
  }).onOk(name => {
    if (name) dataStore.updateCompany(company._id, name);
  });
};

const promptDeleteCompany = (id) => {
  $q.dialog({
    title: 'Delete Company',
    message: 'Are you sure? This will permanently delete the company and all its projects and tasks. Your logged time will be kept, but the labels will be removed.',
    cancel: true,
    color: 'negative'
  }).onOk(() => {
    dataStore.deleteCompany(id);
  });
};

const editProject = (project) => {
  $q.dialog({
    title: 'Edit Project Name',
    prompt: { model: project.name, type: 'text' },
    cancel: true
  }).onOk(name => {
    if (name) {
      $q.dialog({
        title: 'Edit Hourly Rate',
        prompt: { model: project.hourlyRate.toString(), type: 'number' },
        cancel: true
      }).onOk(rate => {
        dataStore.updateProject(project._id, name, Number(rate));
      });
    }
  });
};

const promptDeleteProject = (id) => {
  $q.dialog({
    title: 'Delete Project',
    message: 'Are you sure? This will permanently delete the project and all its tasks. Your logged time will be kept, but the labels will be removed.',
    cancel: true,
    color: 'negative'
  }).onOk(() => {
    dataStore.deleteProject(id);
  });
};

const editTask = (task) => {
  $q.dialog({
    title: 'Edit Task',
    prompt: { model: task.name, type: 'text' },
    cancel: true
  }).onOk(name => {
    if (name) dataStore.updateTask(task._id, name);
  });
};

const promptDeleteTask = (id) => {
  $q.dialog({
    title: 'Delete Task',
    message: 'Are you sure? This will permanently delete the task. Your logged time will be kept, but the label will be removed.',
    cancel: true,
    color: 'negative'
  }).onOk(() => {
    dataStore.deleteTask(id);
  });
};
</script>
