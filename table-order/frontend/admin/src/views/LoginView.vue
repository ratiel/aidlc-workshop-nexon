<script setup lang="ts">
import LoginForm from '@/components/LoginForm.vue';
</script>

<template>
  <div class="login-page" data-testid="login-view">
    <div class="login-container">
      <h1 class="login-title">테이블오더 관리자</h1>
      <LoginForm />
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}
.login-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}
.login-title {
  text-align: center;
  margin: 0 0 32px;
  color: #1976d2;
}
</style>
