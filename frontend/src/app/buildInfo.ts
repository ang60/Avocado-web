/** Set at build time via VITE_BUILD_LABEL (see scripts/deploy-cognitron.sh). */
export const BUILD_LABEL = import.meta.env.VITE_BUILD_LABEL?.trim() || 'dev';
