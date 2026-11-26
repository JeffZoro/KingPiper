export type VoiceGender = 'female' | 'male';

/**
 * ElevenLabs premade voices. Both speak every Piper language through the
 * multilingual voice models. Override with ELEVENLABS_VOICE_FEMALE /
 * ELEVENLABS_VOICE_MALE on the server.
 */
export const DEFAULT_VOICES: Record<VoiceGender, { id: string; name: string; blurb: string }> = {
  female: { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', blurb: 'Bright and warm' },
  male: { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', blurb: 'Smooth and calm' },
};
