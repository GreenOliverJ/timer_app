import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null
  }),
  actions: {
    async login(email, password) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
          this.token = data.token;
          this.user = { id: data._id, name: data.name, email: data.email };
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(this.user));
          return true;
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        throw err;
      }
    },
    async register(name, email, password) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok) {
          this.token = data.token;
          this.user = { id: data._id, name: data.name, email: data.email };
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(this.user));
          return true;
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        throw err;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});
