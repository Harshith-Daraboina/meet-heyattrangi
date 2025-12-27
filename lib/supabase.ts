import { createClient } from "@supabase/supabase-js";

export const getSupabaseAdmin = () => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing Supabase credentials");
    }

    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                persistSession: false,
            },
        }
    );
};
