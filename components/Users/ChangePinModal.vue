<script setup>
    import * as z from 'zod';

    const { userService } = useServices();
    
    const props = defineProps({
        user: {
            type: Object,
            required: true
        }
    });
    const emit = defineEmits(['user:changed']);
    const state = ref({
        pin: await generatePin()
    });
    const open = ref(false);

    const schema = z.object({
        pin: z.string().min(8, 'Pin skal være mindst 8 karakterer langt')
    });

    async function generatePin() {
        const pinData = await userService.generatePin();
        const pin = pinData.pin;
        return pin;
    }

    async function submitPinChange(){
        const success = await userService.changePin(props.user.id, state.value.pin);
        if(success){
            emit('user:changed', true);
            open.value = false;
        }
    }
</script>


<template>
    <UModal title="Skift pin kode" :ui="{footer: 'flex items-center justify-end gap-2'}" v-model:open="open" @update:open="open = $event">
        <UTooltip
            text="Skift pin kode"
            :delay-duration="0"
            :content="{
                side: 'left',
            }"
        >
            <UButton 
                type="button" 
                icon="i-lucide-asterisk" 
                size="lg"
                color="neutral"
                class="cursor-pointer"
                variant="ghost"
            >
            </UButton>
        </UTooltip>

        <template #body>
            <UForm :schema="schema" :state="state">
                <UFormField 
                    label="Ny pin kode" 
                    name="pin" 
                    help="Pin koden bruges til at logge ind i medarbejder systemet."
                    >
                    <UInput 
                        type="text" 
                        name="pin" 
                        v-model="state.pin"
                        class="w-full"
                        />
                </UFormField>
            </UForm>
        </template>

        <template #footer>
            <UButton type="button" variant="ghost" color="neutral" class="cursor-pointer" @click="open = false">
                Annuller
            </UButton>
            <UButton type="button" color="primary" size="lg" class="cursor-pointer" @click="submitPinChange">
                Skift pin
            </UButton>
        </template>
    </UModal>
</template>