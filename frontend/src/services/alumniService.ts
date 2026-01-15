import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosRequestHeaders } from 'axios';
import toast from 'react-hot-toast';

import { apiConnector } from '../utils/APIsConnector';
import { ALUMNI_API } from '../utils/api';
import {
    setLoading,
    setAlumni,
    setTotalCount,
} from '../redux/slices/alumniSlice';
import type { AlumniFilters } from '../redux/slices/alumniSlice';

interface FetchAlumniParams {
    page: number;
    limit: number;
    filters: AlumniFilters;
    search?: string;
}

export const fetchAlumniDirectory = createAsyncThunk(
    'alumni/fetchAlumniDirectory',
    async ({ page, limit, filters, search }: FetchAlumniParams, { dispatch, getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;


            if (!token) {
                return rejectWithValue('Not authenticated');
            }

            dispatch(setLoading(true));

            const params: Record<string, string | number> = {
                page,
                limit,
            };

            if (filters.jnvBatch) params.jnvBatch = filters.jnvBatch;
            if (filters.city) params.city = filters.city;
            if (filters.occupation) params.occupation = filters.occupation;
            if (filters.bloodGroup) params.bloodGroup = filters.bloodGroup;
            if (filters.isMember) params.isMember = filters.isMember;
            if (search) params.search = search;

            const response = await apiConnector(
                'GET',
                ALUMNI_API.GET_ALUMNI_DIRECTORY,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders,
                params as any
            );

            if (response.data.success) {
                dispatch(setAlumni(response.data.data));
                dispatch(setTotalCount(response.data.totalCount));
                dispatch(setLoading(false));
                return response.data;
            } else {
                const errorMessage = response.data.message || 'Failed to fetch alumni';
                dispatch(setLoading(false));
                toast.error(errorMessage);
                return rejectWithValue(errorMessage);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch alumni directory';
            dispatch(setLoading(false));
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);
