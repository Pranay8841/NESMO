import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setToken, setUser, type User } from '../redux/slices/authSlice';

import { apiConnector } from '../utils/APIsConnector';
import { USER_API } from '../utils/api';

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: User, { dispatch }) => {
        try {
            dispatch(setLoading(true));
            const response = await apiConnector(
                'POST',
                USER_API.REGISTER,
                userData,
            );
            dispatch(setLoading(false));
            return response.data as User;
        } catch (error) {
            console.error('Error registering user:', error);
            return null;
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { email: string; password: string }, { dispatch }) => {
        try {
            dispatch(setLoading(true));
            const response = await apiConnector(
                'POST',
                USER_API.LOGIN,
                credentials,
            );
            
            const userImage = response.data?.user?.image ?
                response.data.user.profile.profilePhoto :
                `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`
            
            dispatch(setUser({ ...response.data.user, profile: { ...response.data.user.profile, profilePhoto: userImage } }));
            dispatch(setLoading(false));
            dispatch(setToken(response.data.token));
            return response.data as User;
        } catch (error) {
            console.error('Error logging in user:', error);
            return null;
        }
    }
);

