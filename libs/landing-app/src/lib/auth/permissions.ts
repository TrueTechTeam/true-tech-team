import { createClient } from '../supabase/server';

export interface UserPermissions {
  isAdmin: boolean;
  appAccess: string[]; // slugs of restricted apps this user can access
}

export interface UserProfile {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
}

export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  const supabase = await createClient();
  const [{ data: roles }, { data: apps }] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', userId),
    supabase.from('app_permissions').select('app_slug').eq('user_id', userId),
  ]);

  return {
    isAdmin: (roles ?? []).length > 0,
    appAccess: (apps ?? []).map((a) => a.app_slug as string),
  };
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name')
    .eq('id', userId)
    .single();

  if (!data) {
    return null;
  }
  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
  };
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name')
    .order('email');
  return (data ?? []).map((d) => ({
    id: d.id,
    email: d.email,
    firstName: d.first_name,
    lastName: d.last_name,
  }));
}
