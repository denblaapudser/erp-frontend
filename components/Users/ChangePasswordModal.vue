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
        password: generatePassword()
    });
    const open = ref(false);

    const schema = z.object({
        password: z.string().min(8, 'Password skal være mindst 8 karakterer langt')
    });

    function generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
        let pass = '';
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    }

    async function submitPasswordChange(){
        const success = await userService.changePassword(props.user.id, state.value.password);
        if(success){
            emit('user:changed', true);
            open.value = false;
        }
    }
</script>


<template>
    <UModal title="Skift password" :ui="{footer: 'flex items-center justify-end gap-2'}" v-model:open="open" @update:open="open = $event">
        <UTooltip
            text="Skift password"
            :delay-duration="0"
            :content="{
                side: 'left',
            }"
        >
            <UButton 
                type="button" 
                icon="i-lucide-lock" 
                size="lg"
                color="neutral"
                class="cursor-pointer"
                variant="ghost"
                @click="open = true"
            >
            </UButton>
        </UTooltip>

        <template #body>
            <UForm :schema="schema" :state="state">
                <UFormField 
                    label="Nyt password" 
                    name="password" 
                    help="Password bruges til at logge ind i admin systemet. Hvis du vil skifte pin koden til medarbejder systemet skal du ikke ændre password men i stedet skifte pin koden."
                    >
                    <UInput 
                        type="text" 
                        name="password" 
                        autocomplete="new-password"
                        v-model="state.password"
                        class="w-full"
                        />
                </UFormField>
            </UForm>
        </template>

        <template #footer>
            <UButton type="button" variant="ghost" color="neutral" class="cursor-pointer" @click="open = false">
                Annuller
            </UButton>
            <UButton type="button" color="primary" size="lg" class="cursor-pointer" @click="submitPasswordChange">
                Skift password
            </UButton>
        </template>
    </UModal>
</template>
    