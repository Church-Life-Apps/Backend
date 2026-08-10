# Database migrations

Apply numbered SQL files in order against the SongsV2 PostgreSQL database.
Each file must complete successfully before deploying code that depends on it.

For the canonical Resources synchronization:

1. Apply `001_add_canonical_lyric_types.sql` and commit it.
2. Deploy the Backend and SongsV2 changes.
3. Run the reviewed `Utilities/scripts/songsv2_parity.py --apply` plan.
4. Run the same utility again without `--allow-deltas`. It must report all 813 songs at exact parity and zero unexplained deltas.

The migration is idempotent. The synchronization uses the protected PUT API and atomically replaces each song's complete lyric set.
