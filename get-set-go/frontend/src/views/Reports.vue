<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">Export Report</div>
        <div class="q-mt-sm q-mb-md row q-gutter-sm">
          <q-btn outline dense color="primary" label="Today" @click="setPeriod('today')" />
          <q-btn outline dense color="primary" label="This Week" @click="setPeriod('thisWeek')" />
          <q-btn outline dense color="primary" label="This Month" @click="setPeriod('thisMonth')" />
          <q-btn outline dense color="primary" label="Last Month" @click="setPeriod('lastMonth')" />
        </div>
        <div class="row q-mt-md q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input v-model="startDate" type="date" label="Start Date" outlined dense />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="endDate" type="date" label="End Date" outlined dense />
          </div>
          <div class="col-12 col-md-4 flex items-center">
            <q-btn color="primary" icon="picture_as_pdf" label="Download PDF" @click="downloadPdf" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useQuasar } from 'quasar';

const startDate = ref('');
const endDate = ref('');
const authStore = useAuthStore();
const $q = useQuasar();

const setPeriod = (period) => {
  const now = new Date();
  let start, end;

  const formatDate = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  if (period === 'today') {
    start = new Date();
    end = new Date();
  } else if (period === 'thisWeek') {
    start = new Date();
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
  } else if (period === 'thisMonth') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (period === 'lastMonth') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0);
  }

  startDate.value = formatDate(start);
  endDate.value = formatDate(end);
};

const downloadPdf = async () => {
  try {
    let url = '/api/reports/export';
    const params = new URLSearchParams();
    if (startDate.value) params.append('startDate', startDate.value);
    if (endDate.value) params.append('endDate', endDate.value);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });

    if (res.ok) {
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'GetSetGo_Report.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } else {
      throw new Error('Failed to download report');
    }
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message });
  }
};
</script>
