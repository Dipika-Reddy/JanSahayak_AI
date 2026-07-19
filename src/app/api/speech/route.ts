import { NextResponse } from 'next/server';
import { transcribeAudio } from '@/services/sarvam/speechService';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const lang = formData.get('lang') as string || 'unknown';

    if (!file) {
      return NextResponse.json({ error: 'Missing audio file' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await transcribeAudio(buffer, file.name || 'audio.wav', lang);

    if (!result) {
      return NextResponse.json({ error: 'Transcription failed or unconfigured' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Speech API] Error processing audio transcription:', error);
    return NextResponse.json({ error: 'Internal server error during transcription' }, { status: 500 });
  }
}
