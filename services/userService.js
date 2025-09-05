export const userService = () => {
    const client = useSanctumClient();
    const { login, logout } = useSanctumAuth();
    const { httpErrorText } = useHelpers();
    const resource = 'users';
    const toast = useToast()

    return {
        login: async (userCredentials) => {
            try {
                await login(userCredentials);
                toast.add({ 
                    title: 'Du er nu logget ind', 
                    description: 'Velkommen tilbage!', 
                    color: 'success', 
                    icon: 'i-mdi-check' 
                });
            } catch (error) {
                toast.add({ 
                    title: 'Login fejlede', 
                    description: httpErrorText(error), 
                    color: 'error', icon: 'i-mdi-alert' 
                });
            }
        },

        logout: async () => {
            try {
                await logout();
                toast.add({ 
                    title: 'Du er nu logget ud', 
                    description: 'Vi håber at se dig igen!', 
                    color: 'success', icon: 'i-mdi-check' 
                });
            } catch (error) {
                toast.add({ 
                    title: 'Logout fejlede', 
                    description: httpErrorText(error), 
                    color: 'error', icon: 'i-mdi-alert' 
                });
            }
        },

        get: async (filters = {}) => {
            try {
                return await client(resource, { params: filters });
            } catch (error) {
                toast.add({ 
                    title: 'Fejl ved indlæsning af brugere', 
                    description: httpErrorText(error), 
                    color: 'error', 
                    icon: 'i-mdi-alert' 
                });
            }
        },

        updateOrCreate: async (payload) => {
            try {
                const response = await client(resource, { method: 'POST', body: payload });
                toast.add({ 
                    title: 'Bruger oprettet', 
                    description: response.message, 
                    color: 'success', 
                    icon: 'i-mdi-check' 
                });
                return true;
            } catch (error) {
                toast.add({ 
                    title: 'Der skete en fejl', 
                    description: httpErrorText(error), 
                    color: 'error', 
                    icon: 'i-mdi-alert' 
                });
                return false;
            }
        },

        remove: async (id) => {
            try {
                const response = await client(`${resource}/${id}`, { method: 'DELETE' });
                toast.add({ 
                    title: 'Bruger slettet', 
                    description: response.message, 
                    color: 'success', 
                    icon: 'i-mdi-check' 
                });
                return true;
            } catch (error) {
                toast.add({ 
                    title: 'Der skete en fejl', 
                    description: httpErrorText(error), 
                    color: 'error', 
                    icon: 'i-mdi-alert' 
                });
                return false;
            }
        },
        
        bulkUpdate: async (payload) => {
            try {
                const response = await client(`${resource}/bulk`, { method: 'PUT', body: payload });
                toast.add({ 
                    title: 'Brugere opdateret', 
                    description: response.message, 
                    color: 'success', 
                    icon: 'i-mdi-check' 
                });
                return true;
            } catch (error) {
                toast.add({ 
                    title: 'Der skete en fejl', 
                    description: httpErrorText(error), 
                    color: 'error', 
                    icon: 'i-mdi-alert' 
                });
                return false;
            }
        },

        bulkDelete: async (ids) => {
            try {
                const response = await client(`${resource}/bulk`, { method: 'DELETE', body: { userIds: ids } });
                toast.add({ 
                    title: 'Brugerene blev slettet', 
                    description: response.message, color: 
                    'success', 
                    icon: 'i-mdi-check' 
                });
                return true;
            } catch (error) {
                toast.add({ 
                    title: 'Der skete en fejl', 
                    description: httpErrorText(error), 
                    color: 'error', 
                    icon: 'i-mdi-alert' 
                });
                return false;
            }
        },

        getUserActivities: async (userId, filters) => {
            try {
                return await client(`${resource}/${userId}/activities`, { params: filters });
            } catch (error) {
                toast.add({ 
                    title: 'Fejl ved indlæsning af brugeraktiviteter', 
                    description: httpErrorText(error), 
                    color: 'error', 
                    icon: 'i-mdi-alert' 
                });
            }
        },

        generatePin: async () => {
            try {
                return await client(`${resource}/generate-pin`, { method: 'GET' });
            } catch (error) {
                toast.add({
                    title: 'Fejl ved generering af PIN',
                    description: httpErrorText(error),
                    color: 'error',
                    icon: 'i-mdi-alert'
                });
            }
        },

        changePassword: async (userId, newPassword) => {
            try {
                const response = await client(`${resource}/${userId}/admin/update-password`, { method: 'PUT', body: { password: newPassword } });
                toast.add({ 
                    title: 'Password opdateret', 
                    description: response.message, 
                    color: 'success', 
                    icon: 'i-mdi-check' 
                });
                return true;
            } catch (error) {
                toast.add({ 
                    title: 'Der skete en fejl', 
                    description: httpErrorText(error), 
                    color: 'error', 
                    icon: 'i-mdi-alert' 
                });
                return false;
            }
        },

        changePin: async (userId, newPin) => {
            try {
                const response = await client(`${resource}/${userId}/admin/update-pin`, { method: 'PUT', body: { pin: newPin } });
                toast.add({ 
                    title: 'Pin kode opdateret', 
                    description: response.message, 
                    color: 'success', 
                    icon: 'i-mdi-check' 
                });
                return true;
            } catch (error) {
                toast.add({ 
                    title: 'Der skete en fejl', 
                    description: httpErrorText(error), 
                    color: 'error', 
                    icon: 'i-mdi-alert' 
                });
                return false;
            }
        }
    };
}