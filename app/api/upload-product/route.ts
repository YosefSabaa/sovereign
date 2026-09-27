import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large (max 5MB)' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const safeName = `${folder}/${timestamp}_${Math.random()
      .toString(36)
      .substring(2, 8)}.${ext}`;

    // 🎯 Vercel Blob (Production)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (blobToken) {
      try {
        // ✅ حوّل File لـ Blob صريح
        const bytes = await file.arrayBuffer();
        const blobData = new Blob([bytes], { type: file.type });

        const blob = await put(safeName, blobData, {
          access: 'public',
          addRandomSuffix: false,
          contentType: file.type
        });

        return NextResponse.json({
          success: true,
          url: blob.url,
          provider: 'vercel-blob'
        });
      } catch (blobError: any) {
        console.error('Vercel Blob error:', blobError);
      }
    }

    // 🎯 حفظ محلي (Development)
    const bytes = await file.arrayBuffer();

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });

    const fileName = safeName.split('/').pop() || `image_${timestamp}.${ext}`;

    // ✅ استخدم writeFile مع Buffer.from
    await writeFile(
      path.join(uploadDir, fileName),
      new Uint8Array(bytes)
    );

    const url = `/uploads/${folder}/${fileName}`;

    return NextResponse.json({
      success: true,
      url,
      provider: 'local'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}