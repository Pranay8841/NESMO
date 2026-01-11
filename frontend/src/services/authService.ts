import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setToken, setUser } from '../redux/slices/authSlice';

import { apiConnector } from '../utils/APIsConnector';
import { USER_API } from '../utils/api';

interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: RegisterData, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true));
            const response = await apiConnector(
                'POST',
                USER_API.REGISTER,
                userData,
            );
            
            // After registration, also log the user in
            if (response.data.user) {
                const userImage = response.data.user.profile?.profilePhoto ||
                    `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;
                
                dispatch(setUser({ ...response.data.user, profile: { ...response.data.user.profile, profilePhoto: userImage } }));
            }
            
            if (response.data.token) {
                dispatch(setToken(response.data.token));
                localStorage.setItem('token', JSON.stringify(response.data.token));
            }
            
            dispatch(setLoading(false));
            return response.data;
        } catch (error: any) {
            dispatch(setLoading(false));
            console.error('Error registering user:', error);
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { email: string; password: string }, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true));
            const response = await apiConnector(
                'POST',
                USER_API.LOGIN,
                credentials,
            );
            
            const userImage = response.data?.user?.profile?.profilePhoto ||
                `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;
            
            dispatch(setUser({ ...response.data.user, profile: { ...response.data.user.profile, profilePhoto: userImage } }));
            dispatch(setToken(response.data.token));
            dispatch(setLoading(false));
            
            // Save token to localStorage
            localStorage.setItem('token', JSON.stringify(response.data.token));
            
            return response.data;
        } catch (error: any) {
            dispatch(setLoading(false));
            console.error('Error logging in user:', error);
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

