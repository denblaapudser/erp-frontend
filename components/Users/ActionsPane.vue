<script setup>
const editing = ref(false);

function updateEditing(value) {
    editing.value = value;
    emit('update:editing', value);
}

const emit = defineEmits(['update:open', 'user:changed', 'update:editing']);
const props = defineProps({
    user: {
        type: Object,
        required: true
    }
});


function handleDeletedUser(){
    emit('user:changed', true);
    emit('update:open', false);
}

function save() {
    emit('saveChanges', true);
    updateEditing(false);
    emit('update:open', false);
}

</script>


<template>
    <div class="bg-default rounded-lg shadow p-1 border border-default absolute top-0 -mr-20 right-1 z-10 flex flex-col gap-2">
        <UTooltip
            v-if="editing"
            text="Gem ændringer"
            :delay-duration="0"
            :content="{
                side: 'left',
            }"
        >
            <UButton 
                type="button" 
                icon="i-lucide-save" 
                size="lg"
                @click="save"
                class="cursor-pointer"
                variant="ghost"
            >
            </UButton>
        </UTooltip>

        <USeparator v-if="editing" />
        
        <UTooltip
            v-if="!editing"
            text="Rediger bruger"
            :delay-duration="0"
            :content="{
                side: 'left',
            }"
        >          
            <UButton 
                v-if="!editing"
                type="button" 
                icon="i-lucide-edit" 
                size="lg" 
                color="neutral"
                @click="updateEditing(true)" 
                class="cursor-pointer"
                variant="ghost"
            >
            </UButton>
        </UTooltip>
        <UTooltip
            v-else
            text="Stop redigering"
            :delay-duration="0"
            :content="{
                side: 'left',
            }"
        >
            <UButton 
                type="button" 
                icon="i-lucide-pen-off" 
                size="lg"
                @click="updateEditing(false)"
                color="neutral"
                class="cursor-pointer"
                variant="ghost"
            >
            </UButton>
        </UTooltip>

        <USeparator />

        <UsersChangePasswordModal
            v-if="!editing"
            :user="user"
        />

        <USeparator v-if="!editing"/>

        <UsersChangePinModal
            v-if="!editing"
            :user="user"
        />


        <USeparator v-if="!editing" />

        <UsersDeleteModal
            :user="user"
            @update:editing="updateEditing($event)"
            @user:deleted="handleDeletedUser"
        />

    </div>
</template>