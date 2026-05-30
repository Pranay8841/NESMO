/**
 * @fileoverview Community Redux Slice
 * Manages knowledge entries, smart match results, and reply state.
 * Real-time messages are NOT stored here — they live in CommunityScreen's useState.
 *
 * @module redux/slices/communitySlice
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface MatchedAlumni {
  id: string;
  name: string;
  occupation: string;
  organization?: string;
  location: string;
  sector: string;
  profilePhoto: string;
  batch: string;
}

export interface KnowledgeEntry {
  id: string;
  questionMessageId: string;
  answerMessageIds: string[];
  title: string;
  summary: string;
  category: string;
  tags: string[];
  contributorIds: string[];
  viewCount: number;
  helpfulVotes: number;
  createdAt: any;
}

export interface ReplyingToMessage {
  id: string;
  text: string;
  authorName: string;
}

interface CommunityState {
  /** Curated knowledge entries — fetched once, cached in Redux */
  knowledgeEntries: KnowledgeEntry[];
  isLoadingKnowledge: boolean;
  knowledgeError: string | null;

  /** The message currently being replied to (shared between Feed and Input) */
  replyingTo: ReplyingToMessage | null;

  /** Alumni matched by the most recent smart-match query */
  smartMatchResults: MatchedAlumni[];
  isLoadingSmartMatch: boolean;

}

const initialState: CommunityState = {
  knowledgeEntries: [],
  isLoadingKnowledge: false,
  knowledgeError: null,
  replyingTo: null,
  smartMatchResults: [],
  isLoadingSmartMatch: false,
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    // ── Knowledge Entries ──
    setLoadingKnowledge(state, action: PayloadAction<boolean>) {
      state.isLoadingKnowledge = action.payload;
    },
    setKnowledgeEntries(state, action: PayloadAction<KnowledgeEntry[]>) {
      state.knowledgeEntries = action.payload;
    },
    setKnowledgeError(state, action: PayloadAction<string | null>) {
      state.knowledgeError = action.payload;
    },

    // ── Reply State ──
    setReplyingTo(state, action: PayloadAction<ReplyingToMessage | null>) {
      state.replyingTo = action.payload;
    },
    clearReplyingTo(state) {
      state.replyingTo = null;
    },

    // ── Smart Match ──
    setLoadingSmartMatch(state, action: PayloadAction<boolean>) {
      state.isLoadingSmartMatch = action.payload;
    },
    setSmartMatchResults(state, action: PayloadAction<MatchedAlumni[]>) {
      state.smartMatchResults = action.payload;
    },
    clearSmartMatchResults(state) {
      state.smartMatchResults = [];
    },

  },
});

export const {
  setLoadingKnowledge,
  setKnowledgeEntries,
  setKnowledgeError,
  setReplyingTo,
  clearReplyingTo,
  setLoadingSmartMatch,
  setSmartMatchResults,
  clearSmartMatchResults,
} = communitySlice.actions;

export default communitySlice.reducer;
