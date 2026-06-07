import { createClient } from '@/lib/supabase/client'

const BUCKET = 'uploads' // create this bucket in your Supabase dashboard

// Upload a file and return its public URL
export async function uploadFile(file: File, path: string): Promise<string> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// Get a signed URL (for private buckets)
export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn)

  if (error) throw error
  return data.signedUrl
}

// Delete a file
export async function deleteFile(path: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}
