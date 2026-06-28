import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://irzbyetxlfneqqfbjxzl.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_fuVKXqX0_62llVdW0DYHkw_TgUzFYok'
)
