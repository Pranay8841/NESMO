/**
 * @fileoverview Community Service
 * Axios calls for all Community Knowledge & Guidance System REST endpoints.
 *
 * @module services/communityService
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../utils/APIsConnector';
import { COMMUNITY_API } from '../utils/api';
import {
  setLoadingKnowledge,
  setKnowledgeEntries,
  setKnowledgeError,
  setLoadingSmartMatch,
  setSmartMatchResults,
} from '../redux/slices/communitySlice';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

export interface PostMessagePayload {
  text: string;
  replyTo?: string | null;
  mentions?: string[];
}

export interface ReactPayload {
  emoji: string;
}

export interface ReportPayload {
  reason: string;
}

export interface CreateKnowledgePayload {
  questionMessageId: string;
  answerMessageIds: string[];
  title: string;
  summary?: string;
  tags?: string[];
  category?: string;
}

/* ─────────────────────────────────────────────
   DIRECT API CALLS (non-thunk, for use in components)
   ───────────────────────────────────────────── */

/**
 * Get all active users in the system for tagging/mentions.
 */
export const getMentionableUsers = async () => {
  const response = await apiConnector('GET', COMMUNITY_API.GET_MENTIONABLE_USERS);
  return response.data;
};

/**
 * Post a new message to the community.
 */
export const postMessage = async (payload: PostMessagePayload) => {
  const response = await apiConnector('POST', COMMUNITY_API.POST_MESSAGE, payload);
  return response.data;
};

/**
 * Edit own message (within 15 min).
 */
export const editMessage = async (id: string, text: string) => {
  const response = await apiConnector('PATCH', COMMUNITY_API.EDIT_MESSAGE(id), { text });
  return response.data;
};

/**
 * Soft-delete a message.
 */
export const deleteMessage = async (id: string) => {
  const response = await apiConnector('DELETE', COMMUNITY_API.DELETE_MESSAGE(id));
  return response.data;
};

/**
 * Toggle an emoji reaction on a message.
 */
export const reactToMessage = async (id: string, emoji: string) => {
  const response = await apiConnector('POST', COMMUNITY_API.REACT_TO_MESSAGE(id), { emoji });
  return response.data;
};

/**
 * Report a message.
 */
export const reportMessage = async (id: string, reason: string) => {
  const response = await apiConnector('POST', COMMUNITY_API.REPORT_MESSAGE(id), { reason });
  return response.data;
};

/**
 * Admin: Pin a thread as a knowledge entry.
 */
export const createKnowledgeEntry = async (payload: CreateKnowledgePayload) => {
  const response = await apiConnector('POST', COMMUNITY_API.CREATE_KNOWLEDGE, payload);
  return response.data;
};

/**
 * Request mentorship connection with an alumnus.
 */
export const requestMentorship = async (mentorId: string) => {
  const response = await apiConnector('POST', COMMUNITY_API.REQUEST_MENTORSHIP, { mentorId });
  return response.data;
};

/* ─────────────────────────────────────────────
   THUNKS (dispatch-based, update Redux state)
───────────────────────────────────────────── */

/**
 * Fetch curated knowledge entries and store in Redux.
 * Called once when CommunityScreen mounts.
 */
export const fetchKnowledgeEntries = createAsyncThunk(
  'community/fetchKnowledgeEntries',
  async (query: string | undefined, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoadingKnowledge(true));
      dispatch(setKnowledgeError(null));

      const params: Record<string, string> = {};
      if (query) params.q = query;

      const response = await apiConnector('GET', COMMUNITY_API.GET_KNOWLEDGE, null, null, params);

      if (response.data.success) {
        dispatch(setKnowledgeEntries(response.data.data || []));
        return response.data.data;
      } else {
        dispatch(setKnowledgeError(response.data.message || 'Failed to fetch knowledge entries'));
        return rejectWithValue(response.data.message);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to fetch knowledge entries';
      dispatch(setKnowledgeError(msg));
      return rejectWithValue(msg);
    } finally {
      dispatch(setLoadingKnowledge(false));
    }
  }
);

/**
 * Run smart alumni match for a given query and store results in Redux.
 * Called after a message is sent, triggered by the backend's system message
 * (or manually for pre-send suggestions).
 */
export const runSmartMatch = createAsyncThunk(
  'community/runSmartMatch',
  async (query: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoadingSmartMatch(true));

      const response = await apiConnector(
        'GET',
        COMMUNITY_API.SMART_MATCH,
        null,
        null,
        { q: query }
      );

      if (response.data.success) {
        dispatch(setSmartMatchResults(response.data.data || []));
        return response.data.data;
      }
      return rejectWithValue('No matches found');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Smart match failed');
    } finally {
      dispatch(setLoadingSmartMatch(false));
    }
  }
);


