<script setup>
const props = defineProps({
    userModalOpen: {
        type: Boolean,
        default: false
    },
    user: {
        type: Object,
        default: null
    }
});
const emit = defineEmits(['update:open', 'user:changed']);
const { userCan } = useHelpers();

function handeOpen(open){
    emit('update:open', open);
    if (!open) {
        editing.value = false;
    }
}
const editing = ref(false);


const activeTab = ref('info');
const tabItems = [
    {
        label: 'Oplysninger',
        icon: 'i-lucide-user',
        value: 'info'
    },
    {
        label: 'Aktivitet',
        icon: 'i-lucide-activity',
        value: 'activity'
    }
];

const dialogContentClass = computed(() => {
    switch (activeTab.value) {
        case 'info':
            return 'max-w-2xl w-full';
        case 'activity':
            return 'max-w-3xl w-full';
        default:
            return 'w-full';
    }
});
</script>

<template>
    <UModal
        :open="props.userModalOpen"
        @update:open="handeOpen($event)"
        :ui="{
            header: '!p-0 min-h-0',
            content: dialogContentClass,
        }"
    >
        <template #header>
            <div class="w-full flex items-center justify-between">
                <UTabs 
                    :items="tabItems" 
                    class="" 
                    variant="link" 
                    :content="false"
                    v-model="activeTab"
                    :ui="{
                        trigger: 'py-4 px-7',
                    }"
                    >

                </UTabs>
                <div>
                    <UButton 
                        type="button" 
                        icon="i-lucide-x" 
                        size="lg" 
                        @click="handeOpen(false)" 
                        class="cursor-pointer text-gray-700 mr-4"
                        variant="ghost"
                    >
                    </UButton>
                </div>
            </div>

        </template>

        <template #body>
            <div v-if="activeTab === 'info'" class="relative p-3" :class="{'mr-20': userCan('editUsers')}">
                <UsersDetailsTab 
                    :user="user" 
                    @update:open="handeOpen($event)"
                    @user:changed="emit('user:changed', $event)"
                />
            </div>

            <div v-else-if="activeTab === 'activity'" class="p-3">
                <UsersActivityTab :user="user" />
            </div>
            
        </template>
    </UModal>
</template>