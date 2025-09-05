<script setup>
    import * as z from 'zod';
    const { userService } = useServices();
    
    definePageMeta({
        layout: false,
    })


    const schema = z.object({
        username: z.string(),
        password: z.string().min(1, 'Må ikke være tom'),
        rememberMe: z.boolean().optional()
    })

    const userCredentials = ref({
        username: '',
        password: ''
    })

    const showPassword = ref(false)

    async function onSubmit(event) {
        userService.login(userCredentials.value);
    }
</script>

<template>
    <div class="relative h-screen bg-[url(/img/login-background.webp)] bg-cover bg-center">
        <div class="opacity-70 absolute top-0 left-0 w-screen h-screen bg-default"></div>
        <div class="flex flex-col items-center justify-center h-screen relative z-10">
            <SharedLogo class="mb-10"/>
            <UCard variant="subtle" class="shadow-xl max-w-sm w-full">
                <UForm :schema="schema" :state="userCredentials" class="flex flex-col gap-4" @submit.prevent="onSubmit" >
                    <UFormField label="Email eller brugernavn" name="username">
                        <UInput 
                            v-model="userCredentials.username" 
                            placeholder="Indtast email eller brugernavn" 
                            icon="i-lucide-user" 
                            class="w-full" 
                            size="xl"
                            :ui="{ 
                                leadingIcon: 'w-4',
                            }"
                        />
                    </UFormField>
        
                    <UFormField label="Password" name="password">
                        <UInput
                            v-model="userCredentials.password"
                            placeholder="Password"
                            class="w-full"
                            size="xl"
                            icon="i-lucide-lock"
                            
                            :type="showPassword ? 'text' : 'password'"
                            :ui="{ 
                                trailing: 'pe-1',
                                leadingIcon: 'w-3',
                            }"
                        >
                            <template #trailing>
                            <UButton
                                color="neutral"
                                variant="link"
                                size="sm"
                                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                                :aria-pressed="showPassword"
                                aria-controls="password"
                                @click="showPassword = !showPassword"
                            />
                            </template>
                        </UInput>
                    </UFormField>
                    
                    <UCheckbox v-model="userCredentials.rememberMe" name="rememberMe" label="Husk mig" />
    
                    <UButton type="submit" class="flex justify-center" size="xl" trailing-icon="i-lucide-arrow-right">Log ind</UButton>
                    <p class="text-center text-sm text-gray-500">
                        Hvis ikke du har en bruger skal du kontakte en administrator for at få oprettet en bruger.
                    </p>
                </UForm>
            </UCard>
        </div>
    </div>
</template>