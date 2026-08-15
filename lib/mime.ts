const MIME: Record<string, string> = {
  mp3: 'audio/mpeg', flac: 'audio/flac', m4a: 'audio/mp4',
  m4b: 'audio/mp4', m4p: 'audio/mp4', aac: 'audio/aac',
  ogg: 'audio/ogg', opus: 'audio/ogg', wav: 'audio/wav', wma: 'audio/x-ms-wma',
};

export function mimeFor(format?: string | null): string {
  return MIME[(format ?? '').toLowerCase()] ?? 'application/octet-stream';
}