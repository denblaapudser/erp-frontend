<script setup>
    const open = ref(false);
    const { userService } = useServices();
    const buisy = ref(false);

    const props = defineProps({
        user: {
            type: Object,
            default: null
        },
        disabled: {
            type: Boolean,
            default: false
        }
    });
    const emit = defineEmits(['user:deleted']);

    const deleteUser = async () => {
        buisy.value = true;
        const success = await userService.remove(props.user.id);
        open.value = false;
        if(success){
            emit('user:deleted');
        }
        buisy.value = false;
    };

</script>

<template>
    <UModal v-model:open="open" title="Second modal" :ui="{ footer: 'justify-end' }" @update:open="open = $event">
        <UTooltip
            text="Slet bruger"
            :delay-duration="0"
            :content="{
                side: 'left',
            }"
        >
            <UButton :disabled="disabled" type="button" variant="ghost" color="error" icon="i-lucide-trash-2" class="cursor-pointer" @click="open = true"/>
        </UTooltip>

        <template #title>
            <p class="font-normal">Er du sikker på, at du vil slette denne bruger?</p>
            <p class="text-sm text-gray-500 font-normal">Denne handling kan ikke fortrydes.</p>
        </template>

        <template #body>
            <div class="flex items-center justify-end gap-2">
                <UButton :disabled="buisy" type="button" variant="ghost" color="neutral" class="cursor-pointer" @click="open = false">
                    Annuller
                </UButton>
                <UButton :loading="buisy" type="button" color="error" icon="i-lucide-trash-2" size="lg" class="cursor-pointer" @click="deleteUser">
                    Slet bruger
                </UButton>
            </div>
        </template>
    </UModal>
</template>