# Git history cleanup (done locally)

The following paths were **removed from all commits** so the repo stays small and `git push` succeeds:

| Path | Reason |
|------|--------|
| `node_modules/` | Dependencies — run `npm install` / `pnpm install` after clone |
| `dist/` | Build output — run `npm run build` |
| `src/app/data/KEN_adm2.json` | Duplicate of `public/geo/KEN_adm2.json` |
| `src/app/data/Location.json` | Duplicate of `public/geo/Location.json` |
| `src/app/data/Untitled` | Accidental file |

**Canonical map data** remains in **`public/geo/`** (copied to `dist/geo/` on build).

---

## After cleanup on your machine

1. **Restore `origin`** (history rewrite removes the remote):

   ```bash
   git remote add origin https://github.com/ang60/Avocado-web.git
   ```

   (Use your real URL if different.)

2. **Force-push** (required — history changed):

   ```bash
   git push --force-with-lease origin main
   ```

   Warn anyone else with a clone: they should re-clone or reset hard to the new history.

3. **Reinstall deps** (working tree no longer has `node_modules` from git):

   ```bash
   npm install
   ```

4. Regenerate local copies under `src/app/data/` only if a script still writes there — they are gitignored; maps load from **`public/geo/`**.
