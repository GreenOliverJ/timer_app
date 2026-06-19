<template>
  <q-page padding>
    <q-card flat bordered class="q-mb-md">
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

    <q-card flat bordered>
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
          <q-item-section side class="items-end">
            <div class="row items-center q-gutter-x-sm">
              <div class="column items-end q-mr-sm">
                <div class="text-subtitle1 font-mono">{{ formatDuration(entry.duration) }}</div>
                <div class="text-caption text-grey">{{ new Date(entry.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }} - {{ entry.endTime ? new Date(entry.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Running' }}</div>
              </div>
              <q-btn flat round dense icon="play_arrow" color="primary" @click="reuseEntry(entry)">
                <q-tooltip>Reuse</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="delete" color="negative" @click="deleteEntry(entry._id)">
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
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
  
  const savedState = localStorage.getItem('activeTimer');
  if (savedState) {
    const parsed = JSON.parse(savedState);
    startTime.value = new Date(parsed.startTime);
    description.value = parsed.description;
    selectedCompany.value = parsed.selectedCompany;
    selectedProject.value = parsed.selectedProject;
    selectedTask.value = parsed.selectedTask;
    isRunning.value = true;
    elapsedTime.value = Math.floor((new Date() - startTime.value) / 1000);
    timerInterval.value = setInterval(() => {
      elapsedTime.value = Math.floor((new Date() - startTime.value) / 1000);
    }, 1000);
  }
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

const saveTimerState = () => {
  if (isRunning.value) {
    localStorage.setItem('activeTimer', JSON.stringify({
      startTime: startTime.value,
      description: description.value,
      selectedCompany: selectedCompany.value,
      selectedProject: selectedProject.value,
      selectedTask: selectedTask.value
    }));
  } else {
    localStorage.removeItem('activeTimer');
  }
};

watch([description, selectedCompany, selectedProject, selectedTask], () => {
  if (isRunning.value) saveTimerState();
});

const startTimer = () => {
  isRunning.value = true;
  startTime.value = new Date();
  elapsedTime.value = 0;
  saveTimerState();
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
  saveTimerState();
};

const promptAddCompany = () => {
  $q.dialog({
    title: 'New Company',
    prompt: { model: '', type: 'text' },
    cancel: true
  }).onOk(async name => {
    if (name) {
      const newCompany = await dataStore.addCompany(name);
      selectedCompany.value = newCompany;
      selectedProject.value = null;
      selectedTask.value = null;
    }
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
      }).onOk(async rate => {
        const newProject = await dataStore.addProject(name, Number(rate), selectedCompany.value._id);
        selectedProject.value = newProject;
        selectedTask.value = null;
      });
    }
  });
};

const promptAddTask = () => {
  $q.dialog({
    title: 'New Task',
    prompt: { model: '', type: 'text' },
    cancel: true
  }).onOk(async name => {
    if (name) {
      const newTask = await dataStore.addTask(name, selectedProject.value._id);
      selectedTask.value = newTask;
    }
  });
};

const reuseEntry = (entry) => {
  if (isRunning.value) {
    $q.notify({ type: 'warning', message: 'Stop the current timer first!' });
    return;
  }
  description.value = entry.description;
  selectedCompany.value = entry.company || null;
  selectedProject.value = entry.project || null;
  selectedTask.value = entry.task || null;
  startTimer();
};

const deleteEntry = (id) => {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this time entry?',
    cancel: true
  }).onOk(() => {
    dataStore.deleteTimeEntry(id);
  });
};
</script>

<style scoped>
.font-mono {
  font-family: monospace;
}
</style>
