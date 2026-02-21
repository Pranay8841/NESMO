/**
 * @fileoverview Gallery Service
 * Redux async thunks for gallery/album-related operations.
 * Handles fetching albums, media, uploading, and filter data.
 * 
 * @module services/galleryService
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosRequestHeaders, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
    setAlbumsLoading,
    setMediaLoading,
    setUploadLoading,
    setAlbums,
    appendAlbums,
    setSelectedAlbum,
    setAlbumMedia,
    appendAlbumMedia,
    setLocations,
    setYears,
    setPagination,
    setMediaPagination,
    addAlbum,
    updateAlbumInState,
    removeAlbumFromState,
    addMediaToAlbum,
    removeMediaFromState,
} from '../redux/slices/gallerySlice';
import type { Album, MediaItem } from '../redux/slices/gallerySlice';
import { apiConnector } from '../utils/APIsConnector';
import { ALBUM_API } from '../utils/api';

/* ==================== Album Filters ==================== */

/**
 * Album query filters.
 */
export interface AlbumFilters {
    page?: number;
    limit?: number;
    category?: string;
    year?: string;
    city?: string;
    search?: string;
    featured?: boolean;
}

/* ==================== Fetch Albums ==================== */

/**
 * Fetch all public albums with filters and pagination.
 */
export const fetchAlbums = createAsyncThunk(
    'gallery/fetchAlbums',
    async (filters: AlbumFilters = {}, { dispatch, getState, rejectWithValue }) => {
        try {
            dispatch(setAlbumsLoading(true));
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            // Build query params
            const params = new URLSearchParams();
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
            if (filters.year) params.append('year', filters.year);
            if (filters.city) params.append('city', filters.city);
            if (filters.search) params.append('search', filters.search);
            if (filters.featured) params.append('featured', 'true');

            const url = `${ALBUM_API.GET_ALBUMS}?${params.toString()}`;

            const response = await apiConnector(
                'GET',
                url,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );

            // If page > 1, append albums; otherwise replace
            if (filters.page && filters.page > 1) {
                dispatch(appendAlbums(response.data.data));
            } else {
                dispatch(setAlbums(response.data.data));
            }
            dispatch(setPagination(response.data.pagination));
            dispatch(setAlbumsLoading(false));
            return response.data;
        } catch (error) {
            dispatch(setAlbumsLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch albums';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch single album by ID.
 */
export const fetchAlbumById = createAsyncThunk(
    'gallery/fetchAlbumById',
    async (albumId: string, { dispatch, getState, rejectWithValue }) => {
        try {
            dispatch(setAlbumsLoading(true));
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            const response = await apiConnector(
                'GET',
                `${ALBUM_API.GET_ALBUM_BY_ID}/${albumId}`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );

            dispatch(setSelectedAlbum(response.data.data));
            dispatch(setAlbumsLoading(false));
            return response.data.data as Album;
        } catch (error) {
            dispatch(setAlbumsLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch album';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/* ==================== Fetch Filter Data ==================== */

/**
 * Fetch available locations for filter dropdown.
 */
export const fetchLocations = createAsyncThunk(
    'gallery/fetchLocations',
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            const response = await apiConnector(
                'GET',
                ALBUM_API.GET_LOCATIONS,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );

            dispatch(setLocations(response.data.data));
            return response.data.data as string[];
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch locations');
        }
    }
);

/**
 * Fetch available years for filter dropdown.
 */
export const fetchYears = createAsyncThunk(
    'gallery/fetchYears',
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            const response = await apiConnector(
                'GET',
                ALBUM_API.GET_YEARS,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );

            dispatch(setYears(response.data.data));
            return response.data.data as number[];
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch years');
        }
    }
);

/* ==================== Album Media ==================== */

/**
 * Fetch media for an album.
 */
export const fetchAlbumMedia = createAsyncThunk(
    'gallery/fetchAlbumMedia',
    async ({ albumId, page = 1, limit = 20 }: { albumId: string; page?: number; limit?: number }, { dispatch, getState, rejectWithValue }) => {
        try {
            dispatch(setMediaLoading(true));
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());

            const response = await apiConnector(
                'GET',
                `${ALBUM_API.GET_ALBUM_MEDIA}/${albumId}/media?${params.toString()}`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );

            if (page > 1) {
                dispatch(appendAlbumMedia(response.data.data));
            } else {
                dispatch(setAlbumMedia(response.data.data));
            }
            dispatch(setMediaPagination(response.data.pagination));
            dispatch(setMediaLoading(false));
            return response.data;
        } catch (error) {
            dispatch(setMediaLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch media';
            return rejectWithValue(errorMessage);
        }
    }
);

/* ==================== Album CRUD (Admin/Event Lead) ==================== */

interface CreateAlbumData {
    title: string;
    description?: string;
    category?: string;
    location?: string;
    eventDate?: string;
    visibility?: string;
    isFeatured?: boolean;
    coverImage?: File;
}

/**
 * Create a new album.
 */
export const createAlbum = createAsyncThunk(
    'gallery/createAlbum',
    async (albumData: CreateAlbumData, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Creating album...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            const formData = new FormData();
            formData.append('title', albumData.title);
            if (albumData.description) formData.append('description', albumData.description);
            if (albumData.category) formData.append('category', albumData.category);
            if (albumData.location) formData.append('location', albumData.location);
            if (albumData.eventDate) formData.append('eventDate', albumData.eventDate);
            if (albumData.visibility) formData.append('visibility', albumData.visibility);
            if (albumData.isFeatured !== undefined) formData.append('isFeatured', String(albumData.isFeatured));
            if (albumData.coverImage) formData.append('coverImage', albumData.coverImage);

            const response = await apiConnector(
                'POST',
                ALBUM_API.CREATE_ALBUM,
                formData,
                { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                } as AxiosRequestHeaders
            );

            dispatch(addAlbum(response.data.data));
            toast.success('Album created successfully!', { id: toastId });
            return response.data.data as Album;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to create album';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

interface UpdateAlbumData extends Partial<CreateAlbumData> {
    albumId: string;
}

/**
 * Update an existing album.
 */
export const updateAlbum = createAsyncThunk(
    'gallery/updateAlbum',
    async (albumData: UpdateAlbumData, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Updating album...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            const formData = new FormData();
            if (albumData.title) formData.append('title', albumData.title);
            if (albumData.description !== undefined) formData.append('description', albumData.description);
            if (albumData.category) formData.append('category', albumData.category);
            if (albumData.location !== undefined) formData.append('location', albumData.location);
            if (albumData.eventDate) formData.append('eventDate', albumData.eventDate);
            if (albumData.visibility) formData.append('visibility', albumData.visibility);
            if (albumData.isFeatured !== undefined) formData.append('isFeatured', String(albumData.isFeatured));
            if (albumData.coverImage) formData.append('coverImage', albumData.coverImage);

            const response = await apiConnector(
                'PUT',
                `${ALBUM_API.UPDATE_ALBUM}/${albumData.albumId}`,
                formData,
                { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                } as AxiosRequestHeaders
            );

            dispatch(updateAlbumInState(response.data.data));
            toast.success('Album updated successfully!', { id: toastId });
            return response.data.data as Album;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to update album';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Delete an album.
 */
export const deleteAlbum = createAsyncThunk(
    'gallery/deleteAlbum',
    async (albumId: string, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Deleting album...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            await apiConnector(
                'DELETE',
                `${ALBUM_API.DELETE_ALBUM}/${albumId}`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );

            dispatch(removeAlbumFromState(albumId));
            toast.success('Album deleted successfully!', { id: toastId });
            return albumId;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to delete album';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/* ==================== Media Upload ==================== */

/**
 * Upload media to an album.
 */
export const uploadMediaToAlbum = createAsyncThunk(
    'gallery/uploadMedia',
    async ({ albumId, files }: { albumId: string; files: File[] }, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading(`Uploading ${files.length} file(s)...`);
        try {
            dispatch(setUploadLoading(true));
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            const formData = new FormData();
            files.forEach((file) => {
                formData.append('media', file);
            });

            const response = await apiConnector(
                'POST',
                `${ALBUM_API.UPLOAD_MEDIA}/${albumId}/media`,
                formData,
                { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                } as AxiosRequestHeaders
            );

            dispatch(addMediaToAlbum(response.data.data));
            dispatch(setUploadLoading(false));
            toast.success(response.data.message, { id: toastId });
            return response.data.data as MediaItem[];
        } catch (error) {
            dispatch(setUploadLoading(false));
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to upload media';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Delete a media item from an album.
 */
export const deleteMedia = createAsyncThunk(
    'gallery/deleteMedia',
    async ({ albumId, mediaId }: { albumId: string; mediaId: string }, { dispatch, getState, rejectWithValue }) => {
        const toastId = toast.loading('Deleting media...');
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            await apiConnector(
                'DELETE',
                `${ALBUM_API.DELETE_MEDIA}/${albumId}/media/${mediaId}`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );

            dispatch(removeMediaFromState(mediaId));
            toast.success('Media deleted successfully!', { id: toastId });
            return mediaId;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to delete media';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);
