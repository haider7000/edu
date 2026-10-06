# Supabase production setup

This final client package intentionally contains one database setup file only, to avoid running old/duplicate migrations in the wrong order.

## Fresh Supabase project
1. Open Supabase Dashboard -> SQL Editor.
2. Run `setup/FINAL_SUPABASE_SETUP.sql` once.
3. Follow `FINAL_SETUP.md` for environment variables and first-admin setup.

Do not run SQL files from older development packages on this database.
