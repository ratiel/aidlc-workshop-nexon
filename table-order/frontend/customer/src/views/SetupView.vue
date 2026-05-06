<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sanitizeInput, validateTableNumber, isNonEmpty } from '@/utils/validation'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

const storeId = ref('')
const tableNumber = ref<string | number>('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const isFormValid = computed(() => {
  return isNonEmpty(storeId.value) && isNonEmpty(tableNumber.value) && isNonEmpty(password.value)
})

async function handleSubmit() {
  if (!isFormValid.value || isLoading.value) return

  const sanitizedStoreId = sanitizeInput(storeId.value)
  const parsedTableNumber = validateTableNumber(tableNumber.value)

  if (!sanitizedStoreId) {
    errorMessage.value = '유효한 매장 식별자를 입력해 주세요.'
    return
  }
  if (parsedTableNumber === null) {
    errorMessage.value = '테이블 번호는 1~999 사이의 숫자여야 합니다.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  const success = await authStore.login({
    storeId: sanitizedStoreId,
    tableNumber: parsedTableNumber,
    password: password.value,
  })

  isLoading.value = false

  if (success) {
    router.push('/')
  } else {
    errorMessage.value = '인증에 실패했습니다. 정보를 확인해 주세요.'
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
      <h1 class="text-2xl font-bold text-gray-900 text-center">태블릿 설정</h1>
      <p class="mt-2 text-sm text-gray-500 text-center">관리자가 초기 설정을 진행합니다</p>

      <form class="mt-8 space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="storeId" class="block text-sm font-medium text-gray-700">매장 식별자</label>
          <input
            id="storeId"
            v-model="storeId"
            type="text"
            class="mt-1 min-h-touch w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="매장 식별자 입력"
            autocomplete="off"
            data-testid="setup-store-id"
          />
        </div>

        <div>
          <label for="tableNumber" class="block text-sm font-medium text-gray-700">테이블 번호</label>
          <input
            id="tableNumber"
            v-model="tableNumber"
            type="number"
            inputmode="numeric"
            class="mt-1 min-h-touch w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="테이블 번호 입력"
            min="1"
            max="999"
            data-testid="setup-table-number"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">비밀번호</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="mt-1 min-h-touch w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="비밀번호 입력"
            data-testid="setup-password"
          />
        </div>

        <div v-if="errorMessage" class="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert" data-testid="setup-error">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          class="min-h-touch w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          :disabled="!isFormValid || isLoading"
          data-testid="setup-submit"
        >
          <LoadingSpinner v-if="isLoading" size="sm" />
          <span v-else>저장</span>
        </button>
      </form>
    </div>
  </div>
</template>
