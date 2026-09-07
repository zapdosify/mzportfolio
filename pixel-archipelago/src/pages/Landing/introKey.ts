/** Shown once per tab session, not once per mount. Kept in its own module so
 *  Landing can gate on it without pulling the (lazy-loaded) Intro bundle. */
export const INTRO_SEEN_KEY = "pa:intro-seen";
