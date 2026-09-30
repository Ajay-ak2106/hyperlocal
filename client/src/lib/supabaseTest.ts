import { supabase } from './supabase'

export async function testSupabaseConnection() {
    const { data, error } = await supabase
        .from('incidents')
        .select('id, title, location, severity, status')
        .limit(5)

    if (error) {
        console.error('Supabase connection error:', error)
        return
    }

    console.log('Supabase connected successfully!')
    console.log('Incidents:', data)
}