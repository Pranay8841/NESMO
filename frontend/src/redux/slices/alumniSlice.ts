import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AlumniMember {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    city: string | null;
    occupation: string | null;
    organization: string | null;
    sector: string | null;
    batch: string | null;
    bloodGroup: string | null;
    about: string | null;
    photo: string | null;
    nesmoStatus: string;
}

export interface AlumniFilters {
    jnvBatch: string;
    city: string;
    occupation: string;
    bloodGroup: string;
    isMember: string;
}

interface AlumniState {
    alumni: AlumniMember[];
    loading: boolean;
    page: number;
    totalCount: number;
    filters: AlumniFilters;
    appliedFilters: AlumniFilters;
    searchQuery: string;
}

const initialFilters: AlumniFilters = {
    jnvBatch: '',
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
    name: "alumni",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setAlumni: (state, action: PayloadAction<AlumniMember[]>) => {
            state.alumni = action.payload;
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
