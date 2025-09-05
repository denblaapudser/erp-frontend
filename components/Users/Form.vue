<script setup>
    import { UButton, UsersDeleteModal } from '#components';
    import * as z from 'zod';

    const { accessService, userService } = useServices();
    const accessItems = await accessService.get();
    const accessParents = accessItems.filter(item => item.child_of === null);
    const accessChildren = accessItems.filter(item => item.child_of !== null);
    const buisy = ref(false);

    const props = defineProps({
        user: {
            type: Object,
            default: null
        },
        editing: {
            type: Boolean,
            default: true
        }, 
        updating: {
            type: Boolean,
            default: false
        }
    });

    const emit = defineEmits(['update:open', 'update:editing', 'user:changed']);

    const schema = z.object({
        name: z.string()
            .nonempty('Navn er påkrævet')
            .max(100, 'Navn må højst være 100 tegn')
            .regex(/^[a-zA-ZæøåÆØÅ\s]+$/, 'Navn må kun indeholde bogstaver og mellemrum')
            .refine(val => val.trim().split(' ').length >= 2, {
            message: 'Indtast fornavn og efternavn',
            }),
        email: z.string()
            .optional()
            .refine(val => !val || z.string().email().safeParse(val).success, {
            message: 'Indtast en gyldig email'
            }),
        password: z.string()
            .optional(),
        pin: z.string()
            .length(4, 'PIN skal være 4 cifre')
            .regex(/^\d{4}$/, 'PIN skal kun indeholde cifre')
            .optional(),
        accesses: z.array(z.number()).optional().default([]), 
        })
        .superRefine((data, ctx) => {
            const adminAccessId = 1;
            const isAdminSelected = data.accesses?.includes(adminAccessId);
            const isPasswordMissing = !data.password || data.password.length < 8;

            if (isAdminSelected && isPasswordMissing) {
                ctx.addIssue({
                path: ['password'],
                code: z.ZodIssueCode.custom,
                message: 'Adgangskode er påkrævet, når admin adgang er valgt og skal være mindst 8 tegn'
                });
            }
        });

    async function generatePin() {
        const pinData = await userService.generatePin();
        const pin = pinData.pin;
        return pin;
    }

    const generateUsernameFromName = computed(() => {
        if (props.user && props.user.username) {
            return props.user.username;
        }
        if (state.value.name) {
            const names = state.value.name.trim().toLowerCase().split(' ');
            if (names.length >= 2) {
                return `${names[0].slice(0, 4)}${names[names.length - 1].slice(0, 4)}`;
            } else {
                return names[0].slice(0, 8);
            }
        }
        return '';
    });

    const DEFAULT_EMPLOYEE_ACCESS_ID = 4;

    const initialAccesses =
    props.user?.accesses?.map(a => a.id) ??
    (!props.updating ? [DEFAULT_EMPLOYEE_ACCESS_ID] : []);

    const state = ref({
        name: props.user?.name || '',
        email: props.user?.email || '',
        accesses: initialAccesses,
        password: '',
        pin: props.user?.pin ? '' : await generatePin(),
        username: props.user?.username || generateUsernameFromName,
    });

    async function saveChanges() {
        buisy.value = true;
        const successful = await userService.updateOrCreate({
            id: props.user?.id,
            name: state.value.name,
            email: state.value.email,
            accesses: state.value.accesses,
            username: state.value.username,
            ...(props.updating ? {} : {
                password: state.value.password,
                pin: state.value.pin,
            }),
        });
        if (successful) {
            emit('update:editing', false);
            emit('user:changed', true);
        } 
        buisy.value = false;
    }

    async function cancel() {
        emit('update:editing', false);
        state.value = {
            name: props.user?.name || '',
            email: props.user?.email || '',
            password: '',
            accesses: props.user?.accesses?.map(a => a.id) || [],
            pin: props.user?.pin ? '' : await generatePin(),
            username: props.user?.username || ''
        };
    }

    async function reset(){
        state.value = {
            name: props.user?.name || '',
            email: props.user?.email || '',
            password: '',
            accesses: props.user?.accesses?.map(a => a.id) || [],
            pin: props.user?.pin ? '' : await generatePin(),
            username: props.user?.username || ''
        };
    }

    watch(() => props.editing, (newVal) => {
        if (!newVal) {
            reset();
        }
    });

    function toggleAccess(id) {
    const isParent = accessParents.some(p => p.id === id);
    const isChecked = state.value.accesses.includes(id);

    if (isChecked) {
        // Fjern adgang
        state.value.accesses = state.value.accesses.filter(a => a !== id);

        // Hvis det er en parent, fjern også dets children
        if (isParent) {
        const childIds = accessChildren
            .filter(c => c.child_of === id)
            .map(c => c.id);

        state.value.accesses = state.value.accesses.filter(a => !childIds.includes(a));
        }
    } else {
        // Tilføj adgang (parent eller child)
        state.value.accesses.push(id);
    }
    }

    defineExpose({
        saveChanges,
        reset,
    });
</script>

<template>
    <UForm :schema="schema" :state="state" @submit.prevent="saveChanges">
        <div class="grid grid-cols-2 gap-4">
            <UFormField label="Navn" name="name">
                <UInput
                    v-model="state.name"
                    placeholder="Indtast dit navn"
                    class="w-full"
                    :variant="editing ? 'outline' : 'none'"
                    :readonly="!editing"
                />
            </UFormField>

            <UFormField label="Brugernavn" name="username" :hint="editing ? 'Valgfri' : undefined">
                <UInput
                    v-model="state.username"
                    label="Brugernavn"
                    placeholder="Indtast dit brugernavn"
                    type="text"
                    class="w-full"
                    :variant="editing ? 'outline' : 'none'"
                    :readonly="!editing"
                />
            </UFormField>
    
            <UFormField 
                label="Email" 
                name="email" 
                :hint="editing ? 'Valgfri' : undefined"
                :help="editing ? 'Til at modtage notifikationer' : undefined"
                >
                <UInput
                    v-model="state.email"
                    label="Email"
                    placeholder="Indtast din email"
                    type="email"
                    class="w-full"
                    :variant="editing ? 'outline' : 'none'"
                    :readonly="!editing"
                />
            </UFormField>

            <UFormField 
                v-if="editing && !updating" 
                label="PIN kode" 
                name="pin" 
                :hint="editing ? 'Skal være 4 cifre' : undefined" 
                :help="editing ? 'Til login i medarbejder app' : undefined"
                >
                <UInput
                    v-model="state.pin"
                    placeholder="****"
                    type="text"
                    class="w-full text-white"
                    :variant="editing ? 'outline' : 'none'"
                    :readonly="!updating"
                />
            </UFormField>

            <UFormField 
                v-if="editing && !updating" 
                label="Adgangskode" name="password" 
                :help="editing ? 'Kun påkrævet hvis admin adgang er valgt' : undefined"
                >
                <UInput
                    v-model="state.password"
                    placeholder="**********"
                    type="password"
                    class="w-full"
                    :variant="updating ? 'none' : 'outline'"
                    :readonly="updating"
                />
            </UFormField>
        </div>
        <USeparator class="my-5" />
        <UFormField label="Adgange" name="accesses" class="col-span-2">
            <div class="space-y-4">
                <div
                    v-for="parent in accessParents"
                    :key="parent.id"
                    class="border border-muted p-4 rounded-md space-y-2"
                    >
                    <!-- Parent checkbox -->
                    <UCheckbox
                        :id="`access-parent-${parent.id}`"
                        :label="parent.label"
                        :description="parent.description"
                        :model-value="state.accesses.includes(parent.id)"
                        @update:model-value="checked => toggleAccess(parent.id)"
                        :disabled="!editing"
                        :color="editing ? 'primary' : 'neutral'"
                    />

                    <!-- Child checkboxes -->
                    <div
                        v-if="state.accesses.includes(parent.id) && accessChildren.some(c => c.child_of === parent.id)"
                        class="mt-5 grid grid-cols-2 gap-2 pl-6"
                    >
                        <UCheckbox
                            v-for="child in accessChildren.filter(c => c.child_of === parent.id)"
                            :key="child.id"
                            :id="`access-child-${child.id}`"
                            :label="child.label"
                            :description="child.description"
                            :model-value="state.accesses.includes(child.id)"
                            @update:model-value="checked => toggleAccess(child.id)"
                            :disabled="!editing"
                            :color="editing ? 'primary' : 'neutral'"
                        />
                    </div>
                </div>
            </div>
        </UFormField>



        <div v-if="editing && !updating" class="mt-10 flex items-center justify-end">            
            <div class="flex gap-2">
                <UButton 
                    type="button" 
                    variant="ghost" 
                    @click="cancel()" 
                    class="cursor-pointer"
                    :disabled="buisy"
                >
                    Annuller
                </UButton>
                <UButton type="submit" icon="i-lucide-save" size="lg" class="cursor-pointer" :loading="buisy">
                    opret
                </UButton>
            </div>
        </div>
    </UForm>
</template>