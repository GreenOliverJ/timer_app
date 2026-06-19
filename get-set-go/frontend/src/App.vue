<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-btn v-if="isAuthenticated" dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="app-title">
          Get Set Go
        </q-toolbar-title>
        <q-btn v-if="isAuthenticated" flat @click="logout">Logout</q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="isAuthenticated" v-model="leftDrawerOpen" show-if-above bordered class="bg-dark">
      <q-list>
        <q-item to="/" exact clickable v-ripple active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="timer" />
          </q-item-section>
          <q-item-section>Tracker</q-item-section>
        </q-item>
        <q-item to="/reports" exact clickable v-ripple active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="assessment" />
          </q-item-section>
          <q-item-section>Reports</q-item-section>
        </q-item>
        <q-item to="/settings" exact clickable v-ripple active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const leftDrawerOpen = ref(false);

const isAuthenticated = computed(() => !!authStore.token);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.app-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  letter-spacing: 0.5px;
}
</style>
