
import { LevelData, Difficulty, PipeType, CustomerType } from '../types.ts';

export const encodeLevel = (level: Partial<LevelData>): string => {
  try {
    const json = JSON.stringify(level);
    return btoa(json);
  } catch (e) {
    return '';
  }
};

export const decodeLevel = (code: string): LevelData | null => {
  try {
    const json = atob(code);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

export const getShareUrl = (level: Partial<LevelData>): string => {
  const code = encodeLevel(level);
  const url = new URL(window.location.href);
  url.searchParams.set('level', code);
  return url.toString();
};
