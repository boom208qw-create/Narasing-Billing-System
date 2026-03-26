import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('authUser');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const login = (newToken, newUser) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

export default AuthContext;
