<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { HttpError } from '@/services/api';

const authStore = useAuthStore();
const router = useRouter();

const storeId = ref('');
const username = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

function validateForm(): boolean {
  if (!storeId.value.trim()) {
    errorMessage.value = '매장 식별자를 입력해 주세요';
    return false;
  }
  if (!username.value.trim()) {
    errorMessage.value = '사용자명을 입력해 주세요';
    return false;
  }
  if (!password.value.trim()) {
    errorMessage.value = '비밀번호를 입력해 주세요';
    return false;
  }
  return true;
}

async function handleLogin(): Promise<void> {
  errorMessage.value = '';
  if (!validateForm()) return;

  isLoading.value = true;
  try {
    await authStore.login({
      storeId: storeId.value.trim(),
      username: username.value.trim(),
      password: password.value,
    });
    router.push('/');
  } catch (e) {
    if (e instanceof HttpError) {
      errorMessage.value = '로그인에 실패했습니다. 정보를 확인해 주세요.';
    } else {
      errorMessage.value = '네트워크 연결을 확인해 주세요.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form class="login-form" data-testid="login-form" @submit.prevent="handleLogin">
    <div class="form-group">
      <label for="storeId">매장 식별자</label>
      <input
        id="storeId"
        v-model="storeId"
        type="text"
        placeholder="매장 식별자 입력"
        data-testid="login-store-id-input"
        :disabled="isLoading"
      />
    </div>
    <div class="form-group">
      <label for="username">사용자명</label>
      <input
        id="username"
        v-model="username"
        type="text"
        placeholder="사용자명 입력"
        data-testid="login-username-input"
        :disabled="isLoading"
      />
    </div>
    <div class="form-group">
      <label for="password">비밀번호</label>
      <input
        id="password"
        v-model="password"
        type="password"
        placeholder="비밀번호 입력"
        data-testid="login-password-input"
        :disabled="isLoading"
      />
    </div>
    <p v-if="errorMessage" class="error-text" data-testid="login-error">
      {{ errorMessage }}
    </p>
    <button
      type="submit"
      class="btn btn-primary btn-full"
      data-testid="login-submit-button"
      :disabled="isLoading"
    >
      {{ isLoading ? '로그인 중...' : '로그인' }}
    </button>
  </form>
</template>

<style scoped>
.login-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 14px; font-weight: 500; color: #333; }
.form-group input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
}
.form-group input:focus { outline: none; border-color: #1976d2; }
.error-text { color: #f44336; font-size: 14px; margin: 0; }
.btn-full { width: 100%; padding: 14px; font-size: 16px; }
</style>
