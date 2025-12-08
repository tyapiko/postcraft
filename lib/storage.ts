import { supabase } from './supabase'

export async function uploadImage(
  file: File,
  bucket: string,
  path: string
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${path}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return data.publicUrl
}

export async function deleteImage(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw error
  }
}

export const STORAGE_BUCKETS = {
  BLOG_IMAGES: 'blog-images',
  COURSE_THUMBNAILS: 'course-thumbnails',
  BOOK_COVERS: 'book-covers',
} as const
