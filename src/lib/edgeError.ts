import { FunctionsHttpError } from '@supabase/supabase-js';

/** Extract the REAL error from a failed Edge Function call.
 *
 * `supabase.functions.invoke` reports any non-2xx as the generic
 * "Edge Function returned a non-2xx status code" and hides the function's
 * JSON body (where our functions put the actual reason) behind
 * `error.context` (the raw Response). Read it so users see the cause. */
export async function edgeFunctionError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (body?.error) return String(body.error);
      if (body?.message) return String(body.message);
    } catch {
      /* body wasn't JSON */
    }
    return `Edge function failed (HTTP ${error.context.status}). Check the function logs in Supabase.`;
  }
  return error instanceof Error ? error.message : 'Unknown error';
}
