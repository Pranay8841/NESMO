/**
 * @fileoverview Gallery Redux Slice
 * Manages global gallery state including albums, media, and filters.
 * 
 * @module redux/slices/gallerySlice
 */

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

/** Album category options */
export type AlbumCategory = "ANNUAL_MEET" | "REGIONAL_MEETUP" | "CHARITY_DRIVE" | "OTHER";

/** Album visibility options */
export type AlbumVisibility = "PUBLIC" | "PRIVATE";

/** Media type options */
export type MediaType = "IMAGE" | "VIDEO";

/**
 * Album data structure matching backend Album model.
 */
export interface Album {
    _id: string;
    title: string;
    description?: string;
    category: AlbumCategory;
    coverImage?: string;
    location?: string;
    eventDate?: string;
    isFeatured: boolean;
    visibility: AlbumVisibility;
    mediaCount: number;
    event?: string | { _id: string; title: string; eventDate: string; venue?: string };
    createdBy: string | { _id: string; firstName: string; lastName: string };
    createdAt: string;
    updatedAt: string;
}

/**
 * Media item data structure matching backend Media model.
 */
export interface MediaItem {
    _id: string;
    album: string;
    url: string;
    publicId: string;
    type: MediaType;
    uploadedBy: string | { _id: string; firstName: string; lastName: string };
    isApproved: boolean;
    createdAt: string;
}

/**
 * Pagination info from API response.
 */
export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalAlbums: number;
    hasMore: boolean;
}

/**
 * Media pagination info.
 */
export interface MediaPagination {
    currentPage: number;
    totalPages: number;
    totalMedia: number;
}

/**
 * Gallery state structure.
 */
interface GalleryState {
    /** List of all albums */
    albums: Album[];
    /** Currently selected album for detail view */
    selectedAlbum: Album | null;
    /** Media items for selected album */
    albumMedia: MediaItem[];
    /** Available locations for filter */
    locations: string[];
    /** Available years for filter */
    years: number[];
    /** Pagination info */
    pagination: Pagination | null;
    /** Media pagination info */
    mediaPagination: MediaPagination | null;
    /** Loading states */
    loading: boolean;
    albumsLoading: boolean;
    mediaLoading: boolean;
    uploadLoading: boolean;
}

const initialState: GalleryState = {
    albums: [],
    selectedAlbum: null,
    albumMedia: [],
    locations: [],
    years: [],
    pagination: null,
    mediaPagination: null,
    loading: false,
    albumsLoading: false,
    mediaLoading: false,
    uploadLoading: false,
};

export const gallerySlice = createSlice({
    name: "gallery",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setAlbumsLoading: (state, action: PayloadAction<boolean>) => {
            state.albumsLoading = action.payload;
        },
        setMediaLoading: (state, action: PayloadAction<boolean>) => {
            state.mediaLoading = action.payload;
        },
        setUploadLoading: (state, action: PayloadAction<boolean>) => {
            state.uploadLoading = action.payload;
        },
        setAlbums: (state, action: PayloadAction<Album[]>) => {
            state.albums = action.payload;
        },
        appendAlbums: (state, action: PayloadAction<Album[]>) => {
            state.albums = [...state.albums, ...action.payload];
        },
        setSelectedAlbum: (state, action: PayloadAction<Album | null>) => {
            state.selectedAlbum = action.payload;
        },
        setAlbumMedia: (state, action: PayloadAction<MediaItem[]>) => {
            state.albumMedia = action.payload;
        },
        appendAlbumMedia: (state, action: PayloadAction<MediaItem[]>) => {
            state.albumMedia = [...state.albumMedia, ...action.payload];
        },
        setLocations: (state, action: PayloadAction<string[]>) => {
            state.locations = action.payload;
        },
        setYears: (state, action: PayloadAction<number[]>) => {
            state.years = action.payload;
        },
        setPagination: (state, action: PayloadAction<Pagination | null>) => {
            state.pagination = action.payload;
        },
        setMediaPagination: (state, action: PayloadAction<MediaPagination | null>) => {
            state.mediaPagination = action.payload;
        },
        addAlbum: (state, action: PayloadAction<Album>) => {
            state.albums.unshift(action.payload);
        },
        updateAlbumInState: (state, action: PayloadAction<Album>) => {
            const updatedAlbum = action.payload;
            const index = state.albums.findIndex(a => a._id === updatedAlbum._id);
            if (index !== -1) {
                state.albums[index] = updatedAlbum;
            }
            if (state.selectedAlbum && state.selectedAlbum._id === updatedAlbum._id) {
                state.selectedAlbum = updatedAlbum;
            }
        },
        removeAlbumFromState: (state, action: PayloadAction<string>) => {
            const albumId = action.payload;
            state.albums = state.albums.filter(a => a._id !== albumId);
            if (state.selectedAlbum && state.selectedAlbum._id === albumId) {
                state.selectedAlbum = null;
            }
        },
        addMediaToAlbum: (state, action: PayloadAction<MediaItem[]>) => {
            state.albumMedia = [...action.payload, ...state.albumMedia];
            // Update media count in selected album
            if (state.selectedAlbum) {
                state.selectedAlbum.mediaCount += action.payload.length;
            }
        },
        removeMediaFromState: (state, action: PayloadAction<string>) => {
            const mediaId = action.payload;
            state.albumMedia = state.albumMedia.filter(m => m._id !== mediaId);
            // Update media count in selected album
            if (state.selectedAlbum) {
                state.selectedAlbum.mediaCount = Math.max(0, state.selectedAlbum.mediaCount - 1);
            }
        },
        clearAlbumMedia: (state) => {
            state.albumMedia = [];
            state.mediaPagination = null;
        },
        clearGallery: (state) => {
            state.albums = [];
            state.selectedAlbum = null;
            state.albumMedia = [];
            state.pagination = null;
            state.mediaPagination = null;
        },
    },
});

export const {
    setLoading,
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
    clearAlbumMedia,
    clearGallery,
} = gallerySlice.actions;

export default gallerySlice.reducer;
