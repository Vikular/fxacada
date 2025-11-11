import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getItems = async () => {
    const { data, error } = await supabase
        .from('items')
        .select('*');
    return { data, error };
};

export const addItem = async (item) => {
    const { data, error } = await supabase
        .from('items')
        .insert([item]);
    return { data, error };
};

export const updateItem = async (id, updates) => {
    const { data, error } = await supabase
        .from('items')
        .update(updates)
        .match({ id });
    return { data, error };
};

export const deleteItem = async (id) => {
    const { data, error } = await supabase
        .from('items')
        .delete()
        .match({ id });
    return { data, error };
};