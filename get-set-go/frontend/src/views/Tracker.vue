<template>
  <q-page padding>
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-input v-model="description" placeholder="What are you working on?" dense outlined />
          </div>
          
          <div class="col-12 col-md-2">
            <q-select v-model="selectedCompany" :options="dataStore.companies" option-label="name" label="Company" dense outlined clearable @update:model-value="selectedProject = null; selectedTask = null">
              <template v-slot:after>
                <q-btn round dense flat icon="add" @click="promptAddCompany" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-2">
            <q-select v-model="selectedProject" :options="filteredProjects" option-label="name" label="Project" dense outlined clearable :disable="!selectedCompany" @update:model-value="selectedTask = null">
              <template v-slot:after>
                <q-btn round dense flat icon="add" :disable="!selectedCompany" @click="promptAddProject" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-2">
            <q-select v-model="selectedTask" :options="filteredTasks" option-label="name" label="Task" dense outlined clearable :disable="!selectedProject">
              <template v-slot:after>
                <q-btn round dense flat icon="add" :disable="!selectedProject" @click="promptAddTask" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-3 flex justify-end items-center">
            <div class="text-h5 q-mr-md font-mono">{{ formattedTime }}</div>
            <q-btn v-if="!isRunning" color="primary" label="START" @click="startTimer" />
            <q-btn v-else color="negative" label="STOP" @click="stopTimer" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card>
      <q-card-section>
        <div class="text-h6">Time Entries</div>
      </q-card-section>
      <q-list separator>
        <q-item v-for="entry in dataStore.timeEntries" :key="entry._id">
          <q-item-section>
            <q-item-label>{{ entry.description || '(No description)' }}</q-item-label>
            <q-item-label caption>
              <q-chip v-if="entry.company" size="sm" color="blue-1" text-color="blue">{{ entry.company.name }}</q-chip>
              <q-chip v-if="entry.project" size="sm" color="green-1" text-color="green">{{ entry.project.name }}</q-chip>
              <q-chip v-if="entry.task" size="sm" color="orange-1" text-color="orange">{{ entry.task.name }}</q-chip>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="text-subtitle1 font-mono">{{ formatDuration(entry.duration) }}</div>
            <div class="text-caption text-grey">{{ new Date(entry.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }} - {{ entry.endTime ? new Date(entry.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Running' }}</div>
          </q-item-section>
        </q-item>
        <q-item v-if="dataStore.timeEntries.length === 0">
          <q-item-section class="text-grey text-center">No time entries yet.</q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useDataStore } from '../stores/data';
import { useQuasar } from 'quasar';

const dataStore = useDataStore();
const $q = useQuasar();

const description = ref('');
const selectedCompany = ref(null);
const selectedProject = ref(null);
const selectedTask = ref(null);

const isRunning = ref(false);
const startTime = ref(null);
const timerInterval = ref(null);
const elapsedTime = ref(0);

onMounted(() => {
  dataStore.fetchAll();
});

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value);
});

const filteredProjects = computed(() => {
  if (!selectedCompany.value) return [];
  return dataStore.projects.filter(p => p.company._id === selectedCompany.value._id || p.company === selectedCompany.value._id);
});

const filteredTasks = computed(() => {
  if (!selectedProject.value) return [];
  return dataStore.tasks.filter(t => t.project._id === selectedProject.value._id || t.project === selectedProject.value._id);
});

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const formattedTime = computed(() => formatDuration(elapsedTime.value));

const startTimer = () => {
  isRunning.value = true;
  startTime.value = new Date();
  elapsedTime.value = 0;
  timerInterval.value = setInterval(() => {
    elapsedTime.value = Math.floor((new Date() - startTime.value) / 1000);
  }, 1000);
};

const stopTimer = async () => {
  clearInterval(timerInterval.value);
  const endTime = new Date();
  
  await dataStore.addTimeEntry({
    description: description.value,
    startTime: startTime.value,
    endTime: endTime,
    duration: elapsedTime.value,
    company: selectedCompany.value ? selectedCompany.value._id : null,
    project: selectedProject.value ? selectedProject.value._id : null,
    task: selectedTask.value ? selectedTask.value._id : null
  });

  isRunning.value = false;
  description.value = '';
  elapsedTime.value = 0;
};

const promptAddCompany = () => {
  $q.dialog({
    title: 'New Company',
    prompt: { model: '', type: 'text' },
    cancel: true
  }).onOk(name => {
    if (name) dataStore.addCompany(name);
  });
};

const promptAddProject = () => {
  $q.dialog({
    title: 'New Project',
    message: 'Enter Project Name and Hourly Rate (EUR)',
    prompt: { model: '', type: 'text' },
    cancel: true
  }).onOk(name => {
    if (name) {
      $q.dialog({
        title: 'Hourly Rate',
        prompt: { model: '0', type: 'number' },
        cancel: true
      }).onOk(rate => {
        dataStore.addProject(name, Number(rate), selectedCompany.value._id);
      });
    }
  });
};

const promptAddTask = () => {
  $q.dialog({
    title: 'New Task',
    prompt: { model: '', type: 'text' },
    cancel: true
  }).onOk(name => {
    if (name) dataStore.addTask(name, selectedProject.value._id);
  });
};
</script>

<style scoped>
.font-mono {
  font-family: monospace;
}
</style>
