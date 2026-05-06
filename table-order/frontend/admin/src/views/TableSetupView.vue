<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { adminApi } from '@/services/admin-api';
import AppHeader from '@/components/common/AppHeader.vue';
import { HttpError } from '@/services/api';

const router = useRouter();
const tableNumber = ref<number | null>(null);
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

function validate(): boolean {
  if (!tableNumber.value || tableNumber.value < 1 || tableNumber.value > 10) {
    errorMessage.value = '1~10 사이의 테이블 번호를 입력해 주세요';
    return false;
  }
  if (password.value.length < 4) {
    errorMessage.value = '비밀번호는 4자 이상이어야 합니다';
    return false;
  }
  return true;
}

async function handleSetup(): Promise<void> {
  errorMessage.value = '';
  successMessage.value = '';
  if (!validate()) return;

  isLoading.value = true;
  try {
    await adminApi.setupTable({
      tableNumber: tableNumber.value!,
      password: password.value,
    });
    successMessage.value = `테이블 ${tableNumber.value}번 설정이 완료되었습니다.`;
    tableNumber.value = null;
    password.value = '';
  } catch (e) {
    if (e instanceof HttpError) {
      errorMessage.value = e.errorBody.message;
    } else {
      errorMessage.value = '설정에 실패했습니다. 다시 시도해 주세요.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="setup-page" data-testid="table-setup-view">
    <AppHeader />
    <main class="setup-content">
      <div class="setup-header">
        <h2>테이블 설정</h2>
        <button class="btn btn-secondary" @click="router.push('/')">돌아가기</button>
      </div>
      <form class="setup-form" @submit.prevent="handleSetup">
        <div class="form-group">
          <label for="tableNumber">테이블 번호 (1~10)</label>
          <input
            id="tableNumber"
            v-model.number="tableNumber"
            type="number"
            min="1"
            max="10"
            placeholder="테이블 번호"
            data-testid="setup-table-number-input"
            :disabled="isLoading"
          />
        </div>
        <div class="form-group">
          <label for="tablePassword">비밀번호 (4자 이상)</label>
          <input
            id="tablePassword"
            v-model="password"
            type="password"
            placeholder="비밀번호"
            data-testid="setup-password-input"
            :disabled="isLoading"
          />
        </div>
        <p v-if="errorMessage" class="error-text" data-testid="setup-error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-text" data-testid="setup-success">{{ successMessage }}</p>
        <button
          type="submit"
          class="btn btn-primary"
          data-testid="setup-submit-button"
          :disabled="isLoading"
        >
          {{ isLoading ? '설정 중...' : '설정 저장' }}
        </button>
      </form>
    </main>
  </div>
</template>

<style scoped>
.setup-page { min-height: 100vh; background: #f5f5f5; }
.setup-content { padding: 24px; max-width: 500px; margin: 0 auto; }
.setup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.setup-header h2 { margin: 0; }
.setup-form { background: white; padding: 24px; border-radius: 12px; display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 14px; font-weight: 500; }
.form-group input { padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 15px; }
.error-text { color: #f44336; font-size: 14px; margin: 0; }
.success-text { color: #4caf50; font-size: 14px; margin: 0; }
</style>
