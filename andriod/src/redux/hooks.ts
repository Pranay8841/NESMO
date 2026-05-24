/**
 * @fileoverview Redux Hooks
 * Typed hooks for dispatch and selector
 * 
 * @module redux/hooks
 */

import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * Typed dispatch hook
 * Use instead of useDispatch for better type inference
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed selector hook
 * Use instead of useSelector for better type inference
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
