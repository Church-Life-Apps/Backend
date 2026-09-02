-- Run this migration before deploying Backend code that writes canonical
-- Resources intro, tag, and ending lyric blocks.
--
-- PostgreSQL enum values must be committed before they are used. Do not wrap
-- this migration and the subsequent data synchronization in one transaction.

ALTER TYPE lyric_type ADD VALUE IF NOT EXISTS 'LYRIC_TYPE_TAG';
ALTER TYPE lyric_type ADD VALUE IF NOT EXISTS 'LYRIC_TYPE_ENDING';
ALTER TYPE lyric_type ADD VALUE IF NOT EXISTS 'LYRIC_TYPE_INTRO';
