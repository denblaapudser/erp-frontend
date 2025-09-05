<script setup>
import { UCheckbox, UInput, UPagination, UAvatar } from '#components'

const { userService } = useServices()
const { userCan } = useHelpers()
const loading = ref(true)
const users = ref([])
const userTotal = ref(0)
const selectedUsers = ref([])
const selectedUser = ref(null)
const userModalOpen = ref(false)
const createModalOpen = ref(false)
const userRequestParams = ref({
    page: 1,
    perPage: 20,
    search: ''
})

const rowSelection = ref({})

function handleSelectedUsers(selectedId, value) {
  if (value && !selectedUsers.value.includes(selectedId)) {
    selectedUsers.value.push(selectedId)
  } else if (!value) {
    selectedUsers.value = selectedUsers.value.filter(id => id !== selectedId)
  }
}

function clearSelection() {
  selectedUsers.value = []
  rowSelection.value = {}
}

function onSelect(row) {
  selectedUser.value = row.original
  userModalOpen.value = true
}

function updateFilters() {
  userRequestParams.value.page = 1
  loadUsers()
}

async function loadUsers() {
    selectedUsers.value = []
    rowSelection.value = {}
    loading.value = true
    const paginatedUsers = await userService.get(userRequestParams.value)
    users.value = paginatedUsers.data
    userTotal.value = paginatedUsers.total
    loading.value = false
}

onMounted(loadUsers)
</script>

<template>
  <NuxtLayout pageTitle="Alle brugere">
    <template #pageActions>
      <div class="flex-1 flex items-center justify-between gap-2">
        <UInput
            placeholder="Søg efter brugere..."
            class="w-64"
            icon="i-lucide-search"
            v-model="userRequestParams.search"
            @keyup="updateFilters"
        />
        <div class="flex items-center gap-2" v-if="userCan('editUsers')" >
          <UsersCreateModal v-model:open="createModalOpen" @user:changed="loadUsers" />
        </div>
      </div>
    </template>

    <UsersDetailsModal 
      v-model:open="userModalOpen" 
      :user="selectedUser"
      @user:changed="loadUsers"
      @update:open="userModalOpen = $event"
    />

    <UCard class="relative">
      <div
        v-if="selectedUsers.length > 0 && userCan('editUsers')"
        class="rounded-xl overflow-hidden z-10 shadow-xl absolute bottom-15 left-1/2 transform -translate-x-1/2 flex justify-between items-center bg-gray-800"
      >
        <UButton 
          variant="ghost"
          color="neutral"
          class="cursor-pointer p-4 rounded-none text-white hover:bg-gray-600"
          size="lg"
          @click="clearSelection"
        >
          Fjern valgte ({{ selectedUsers.length }})
        </UButton>
        <UsersBulkDelete :selectedUsers="selectedUsers" @users:deleted="loadUsers" />
        <UsersBulkEdit :selectedUsers="selectedUsers" @users:updated="loadUsers" />
      </div>

      <UTable
        :loading="loading"
        :data="users"
        sticky
        class="h-[75vh] w-full"
        :rowSelection="rowSelection"
        :columns="[
            ...(userCan('editUsers') ? [{
            id: 'select',
            header: ({ table }) =>
              h(UCheckbox, {
              modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
              'onUpdate:modelValue': (value) => {
                table.toggleAllPageRowsSelected(value)
                const ids = table.getRowModel().rows.map(r => r.original.id)
                ids.forEach(id => handleSelectedUsers(id, value))
              },
              'aria-label': 'Vælg alle'
              }),
            cell: ({ row }) =>
              h(UCheckbox, {
              modelValue: row.getIsSelected(),
              'onUpdate:modelValue': (val) => {
                row.toggleSelected(val)
                handleSelectedUsers(row.original.id, val)
              }
              })
            }] : []),
          { 
            accessorKey: 'name', 
            header: 'Navn', 
            cell: ({ row }) => {
              return h('div', { class: 'flex items-center gap-3' }, [
                h(UAvatar, {
                  alt: row.original.name,
                  size: 'lg'
                }),
                h('div', undefined, [
                  h('p', { class: 'font-medium text-highlighted' }, row.original.name),
                  h('p', { class: '' }, `@${row.original.username}`)
                ])
              ])
            } 
          },
          {
            accessorKey: 'accesses',
            header: 'Adgang',
            cell: ({ row }) => row.original.accesses?.length + ' adgange' ?? 'Ingen adgang'
          }
        ]"
        :ui="{
          tbody: 'cursor-pointer',
        }"
        @select="onSelect"
      >
        <template #loading>
          <div v-for="i in 20" :key="i">
            <USkeleton class="h-10 w-full mb-5" />
          </div>
        </template>
      </UTable>
    </UCard>

    <div class="mt-4 flex justify-between items-center">
        <span v-if="userTotal > 0" class="text-sm text-gray-500">
          Viser {{ userRequestParams.page }} - {{ userRequestParams.page * userRequestParams.perPage }} af {{ userTotal }} brugere
        </span>
        <UPagination
            v-if="userTotal > userRequestParams.perPage"
            v-model:page="userRequestParams.page"
            :total="userTotal"
            show-edges
            variant="ghost"
            :items-per-page="userRequestParams.perPage"
            @update:page="loadUsers"
        />
    </div>
  </NuxtLayout>
</template>