import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import UserFitnessProfile from '@/models/UserFitnessProfile';
import { generatePlanFromImportedDocument } from '@/lib/gemini';
import type { IUserFitnessProfile } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_EXTRACTED_CHARACTERS = 15_000;

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Please choose a PDF file.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ success: false, error: 'Only PDF files are supported.' }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'PDF must be smaller than 2 MB.' },
        { status: 400 }
      );
    }

    const data = new Uint8Array(await file.arrayBuffer());
    const pdfSignature = new TextDecoder().decode(data.slice(0, 5));
    if (pdfSignature !== '%PDF-') {
      return NextResponse.json({ success: false, error: 'The uploaded file is not a valid PDF.' }, { status: 400 });
    }

    const parser = new PDFParse({ data });
    let text = '';
    try {
      text = (await parser.getText()).text.trim();
    } finally {
      await parser.destroy();
    }

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'No readable text was found. Please upload a text-based PDF, not a scanned image.' },
        { status: 400 }
      );
    }

    await connectDB();
    const profile = await UserFitnessProfile.findOne({ userId: user.id }).lean();
    const plan = await generatePlanFromImportedDocument(
      text.slice(0, MAX_EXTRACTED_CHARACTERS),
      profile as IUserFitnessProfile | null
    );

    return NextResponse.json({
      success: true,
      data: plan,
      message: 'PDF analyzed. Review the proposed plan before applying it.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process the PDF.';
    if (message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
