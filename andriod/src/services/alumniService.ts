/**
 * @fileoverview Alumni Directory Service for React Native
 * Redux async thunk for fetching the alumni directory with filters and pagination.
 * 
 * @module services/alumniService
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../utils/APIsConnector';
import { ALUMNI_API } from '../utils/api';
import {
  setLoading,
  setAlumni,
  setTotalCount,
  setError,
} from '../redux/slices/alumniSlice';
import type { AlumniFilters } from '../redux/slices/alumniSlice';

/** Parameters for fetching alumni directory */
interface FetchAlumniParams {
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Active filters to apply */
  filters: AlumniFilters;
  /** Optional search query */
  search?: string;
}

/**
 * Fetch paginated alumni directory with filters.
 * Applies filters for batch, city, occupation, blood group, and membership.
 * 
 * @async
 * @function fetchAlumniDirectory
 * @param {FetchAlumniParams} params - Pagination and filter parameters
 * @returns {Promise<Object>} Alumni list with pagination metadata
 * 
 * @dispatches setLoading, setAlumni, setTotalCount, setError
 * 
 * @example
 * dispatch(fetchAlumniDirectory({
 *   page: 1,
 *   limit: 20,
 *   filters: { passoutBatch: '2015', city: 'Delhi' },
 *   search: 'John'
 * }))
 */
export const fetchAlumniDirectory = createAsyncThunk(
  'alumni/fetchAlumniDirectory',
  async ({ page, limit, filters, search }: FetchAlumniParams, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const params: Record<string, string | number> = {
        page,
        limit,
      };

      if (filters.joinBatch) params.joinBatch = filters.joinBatch;
      if (filters.passoutBatch) params.passoutBatch = filters.passoutBatch;
      if (filters.city) params.city = filters.city;
      if (filters.organization) params.organization = filters.organization;
      if (filters.bloodGroup) params.bloodGroup = filters.bloodGroup;
      if (search) params.search = search;

      const response = await apiConnector(
        'GET',
        ALUMNI_API.GET_ALUMNI_DIRECTORY,
        null,
        null,
        params as any
      );

      if (response.data.success) {
        dispatch(setAlumni(response.data.data || []));
        dispatch(setTotalCount(response.data.totalCount || 0));
        return response.data;
      } else {
        const errorMessage = response.data.message || 'Failed to fetch alumni';
        dispatch(setError(errorMessage));
        return rejectWithValue(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch alumni directory';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);
