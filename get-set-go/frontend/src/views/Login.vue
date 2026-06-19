<template>
  <q-page class="flex flex-center bg-dark-page">
    <q-card flat bordered class="bg-dark" style="width: 400px; max-width: 90vw;">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{ isLogin ? 'Login' : 'Register' }}</div>
      </q-card-section>
      
      <q-card-section>
        <q-form @submit.prevent="onSubmit">
          <q-input v-if="!isLogin" v-model="name" label="Name" required />
          <q-input v-model="email" type="email" label="Email" required />
          <q-input v-model="password" type="password" label="Password" required />
          
          <div class="q-mt-md">
            <q-btn type="submit" color="primary" class="full-width">{{ isLogin ? 'Login' : 'Register' }}</q-btn>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn flat @click="isLogin = !isLogin" color="primary">
          {{ isLogin ? 'Need an account? Register' : 'Have an account? Login' }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const isLogin = ref(true);
const name = ref('');
const email = ref('');
const password = ref('');

const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const onSubmit = async () => {
  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value);
    } else {
      await authStore.register(name.value, email.value, password.value);
    }
    router.push('/');
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message });
  }
};
</script>
