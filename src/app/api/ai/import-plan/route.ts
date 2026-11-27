import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import UserFitnessProfile from '@/models/UserFitnessProfile';
import { generatePlanFromImportedDocument } from '@/lib/gemini';
import {
  extractTextFromPdfBytes,
  PdfImportError,
  validatePdfUpload,
} from '@/lib/pdf-import';
import type { IUserFitnessProfile } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Upload must be sent as multipart/form-data.' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Please choose a PDF file.' },
        { status: 400 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    validatePdfUpload({
      fileName: file.name,
      fileType: file.type,
      size: file.size,
      bytes,
    });

    const extractedText = await extractTextFromPdfBytes(bytes);

    await connectDB();
    const profile = await UserFitnessProfile.findOne({ userId: user.id }).lean();
    const plan = await generatePlanFromImportedDocument(
      extractedText,
      profile as unknown as IUserFitnessProfile | null
    );

    return NextResponse.json({
      success: true,
      data: plan,
      message: 'PDF analyzed. Review the proposed plan before applying it.',
    });
  } catch (error) {
    if (error instanceof PdfImportError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Unable to process the PDF.';
    if (message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
