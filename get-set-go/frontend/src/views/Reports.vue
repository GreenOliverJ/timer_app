<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">Export Report</div>
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
