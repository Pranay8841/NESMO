/**
 * @fileoverview Alumni Directory Redux Slice
 * Manages alumni directory state including list, pagination, filters, and search.
 * 
 * @module redux/slices/alumniSlice
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/**
 * Alumni member data structure.
 * Represents a single alumni in the directory.
 */
export interface AlumniMember {
  /** MongoDB ObjectId */
  id: string;
  /** Full name (firstName + lastName) */
  name: string;
  /** Email address */
  email: string;
  /** Contact phone number */
  phone: string | null;
  /** Current city/location */
  city: string | null;
  /** Current occupation */
  occupation: string | null;
  /** Company/organization name */
  organization: string | null;
  /** Work sector */
  sector: string | null;
  /** Year of joining JNV */
  joinBatch: string | null;
  /** Year of passing out from JNV */
  passoutBatch: string | null;
  /** Blood group */
  bloodGroup: string | null;
  /** User bio/about section */
  about: string | null;
  /** Profile photo URL */
  photo: string | null;
  /** User role (ALUMNI, MEMBER, EVENT_LEAD, ADMIN) */
  role: 'ALUMNI' | 'MEMBER' | 'EVENT_LEAD' | 'ADMIN';
  /** Whether user is a paid member */
  isMember: boolean;
}

/**
 * Filter options for alumni directory.
 */
export interface AlumniFilters {
  /** Filter by JNV joining batch year */
  joinBatch: string;
  /** Filter by JNV passout batch year */
  passoutBatch: string;
  /** Filter by city (case-insensitive) */
  city: string;
  /** Filter by occupation (case-insensitive) */
  occupation: string;
  /** Filter by blood group */
  bloodGroup: string;
  /** Filter by NESMO membership ("true"/"false") */
  isMember: string;
}

/**
 * Alumni directory state structure.
 */
interface AlumniState {
  /** List of alumni members */
  alumni: AlumniMember[];
  /** Loading state for directory operations */
  loading: boolean;
  /** Current page number (1-indexed) */
  page: number;
  /** Total count of alumni matching filters */
  totalCount: number;
  /** Current filter values (in filter form) */
  filters: AlumniFilters;
  /** Applied filter values (used in API call) */
  appliedFilters: AlumniFilters;
  /** Current search query */
  searchQuery: string;
}

const initialFilters: AlumniFilters = {
  joinBatch: '',
  passoutBatch: '',
  city: '',
  occupation: '',
  bloodGroup: '',
  isMember: '',
};

const initialState: AlumniState = {
  alumni: [],
  loading: false,
  page: 1,
  totalCount: 0,
  filters: { ...initialFilters },
  appliedFilters: { ...initialFilters },
  searchQuery: '',
};

export const alumniSlice = createSlice({
  name: 'alumni',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAlumni: (state, action: PayloadAction<AlumniMember[]>) => {
      state.alumni = action.payload;
    },
    addAlumni: (state, action: PayloadAction<AlumniMember[]>) => {
      state.alumni.push(...action.payload);
    },
    setTotalCount: (state, action: PayloadAction<number>) => {
      state.totalCount = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<AlumniFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    applyFilters: (state) => {
      state.appliedFilters = { ...state.filters };
      state.page = 1;
    },
    clearFilters: (state) => {
      state.filters = { ...initialFilters };
      state.appliedFilters = { ...initialFilters };
      state.page = 1;
    },
    removeFilter: (state, action: PayloadAction<keyof AlumniFilters>) => {
      state.filters[action.payload] = '';
      state.appliedFilters[action.payload] = '';
      state.page = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1; // Reset to page 1 when searching
    },
    resetAlumniState: () => initialState,
  },
});

export const {
  setLoading,
  setAlumni,
  addAlumni,
  setTotalCount,
  setPage,
  setFilters,
  applyFilters,
  clearFilters,
  removeFilter,
  setSearchQuery,
  resetAlumniState,
} = alumniSlice.actions;

export default alumniSlice.reducer;
