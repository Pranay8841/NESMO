import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../redux/hooks';
import { setToken, setLoading } from '../redux/slices/authSlice';
import { apiConnector } from '../utils/APIsConnector';
import { USER_API } from '../utils/api';
import { setUser } from '../redux/slices/authSlice';
import type { AxiosRequestHeaders } from 'axios';
import AuthLoading from '../components/Authentication/AuthLoading';

export default function OAuthSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const hasRun = useRef(false);

    useEffect(() => {
        // Prevent double execution in React StrictMode
        if (hasRun.current) return;
        hasRun.current = true;

        const handleOAuthSuccess = async () => {
            const token = searchParams.get('token');

            if (!token) {
                toast.error('No token received');
                navigate('/oauth-error?message=No token received');
                return;
            }

            const toastId = toast.loading('Completing sign in...');

            try {
                dispatch(setLoading(true));
                
                // Save token to localStorage and Redux
                localStorage.setItem('token', JSON.stringify(token));
                dispatch(setToken(token));

                // Fetch user data with the token
                const response = await apiConnector(
                    'GET',
                    USER_API.CURRENT_USER,
                    null,
                    { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
                );

                if (response.data.user) {
                    const user = response.data.user;
                    const userImage = user.profile?.profilePhoto ||
                        `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`;
                    
                    dispatch(setUser({
                        ...user,
                        profile: { ...user.profile, profilePhoto: userImage }
                    }));
                }

                dispatch(setLoading(false));
                toast.success('Welcome back!', { id: toastId });
                navigate('/dashboard');
            } catch (error) {
                console.error('OAuth success handling failed:', error);
                dispatch(setLoading(false));
                toast.error('Failed to complete authentication', { id: toastId });
                navigate('/oauth-error?message=Failed to complete authentication');
            }
        };

        handleOAuthSuccess();
    }, [searchParams, navigate, dispatch]);

    return (
        <AuthLoading 
            message="Completing sign in..." 
            subMessage="Please wait while we set up your account." 
        />
    );
}
