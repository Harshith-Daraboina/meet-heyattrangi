
import { NextResponse } from 'next/server';

export async function GET() {
    const vars = {
        SUPABASE_URL: process.env.SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Unset',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Unset',
        ALL_KEYS: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
    };
    return NextResponse.json(vars);
}
