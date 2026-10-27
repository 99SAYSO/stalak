// Cloudflare Pages Function: catches every /api/* request and hands it to the router.
// Pages looks for `functions/` at the project root (not inside the `public/` output dir).
import { handle } from '../_lib/router.js';

export const onRequest = (context) => handle(context.request, context.env, context);
