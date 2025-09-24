// Simple mock version of useAuth hook for development
export function useAuth() {
  return {
    isLoading: false,
    isAuthenticated: false, // Set to false so we can see the landing page
    user: null,
    signIn: () => console.log('Mock sign in'),
    signOut: () => console.log('Mock sign out'),
  };
}