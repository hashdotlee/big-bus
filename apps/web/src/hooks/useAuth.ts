import { useMutation, useQuery, useQueryClient } from 'react-query';
import { api, setToken, clearToken } from '@big-bus/api-client';
import { useAuthStore } from '@/store/auth.store';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const loginMutation = useMutation(
    async (data: { email: string; password: string }) => {
      return api.auth.login(data);
    },
    {
      onSuccess: (data) => {
        setAuth(data.user, data.accessToken);
        setToken(data.accessToken);
      },
    }
  );

  const registerMutation = useMutation(
    async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone: string;
    }) => {
      return api.auth.register(data);
    },
    {
      onSuccess: (data) => {
        setAuth(data.user, data.accessToken);
        setToken(data.accessToken);
      },
    }
  );

  const logoutMutation = useMutation(
    async () => {
      return api.auth.logout();
    },
    {
      onSuccess: () => {
        clearAuth();
        clearToken();
        queryClient.clear();
      },
    }
  );

  const { data: currentUser, refetch: refetchUser } = useQuery(
    'currentUser',
    () => api.auth.getCurrentUser(),
    {
      enabled: isAuthenticated,
      retry: false,
    }
  );

  return {
    user: user || currentUser,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isLoading,
    isRegistering: registerMutation.isLoading,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    refetchUser,
  };
};
