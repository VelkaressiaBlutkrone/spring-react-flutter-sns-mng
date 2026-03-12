import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export class LiveAudioService {
  private ai: GoogleGenAI;
  private session: any = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private audioQueue: Int16Array[] = [];
  private isPlaying = false;
  private nextStartTime = 0;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async connect(callbacks: {
    onMessage?: (text: string) => void;
    onInterrupted?: () => void;
    onError?: (err: any) => void;
    onClose?: () => void;
  }) {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      this.session = await this.ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a helpful assistant for MapSNS, a location-based social network. You can help users find places, plan routes, and explain how to use the app. Keep your responses concise and friendly.",
        },
        callbacks: {
          onopen: () => {
            this.startMic();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const base64Data = part.inlineData.data;
                  const binaryString = atob(base64Data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const pcmData = new Int16Array(bytes.buffer);
                  this.playAudio(pcmData);
                }
                if (part.text) {
                  callbacks.onMessage?.(part.text);
                }
              }
            }
            if (message.serverContent?.interrupted) {
              this.stopAudio();
              callbacks.onInterrupted?.();
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            callbacks.onError?.(err);
          },
          onclose: () => {
            this.cleanup();
            callbacks.onClose?.();
          },
        },
      });
    } catch (err) {
      console.error("Failed to connect to Live API:", err);
      throw err;
    }
  }

  private async startMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.source = this.audioContext!.createMediaStreamSource(stream);
      this.processor = this.audioContext!.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        this.session?.sendRealtimeInput({
          media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext!.destination);
    } catch (err) {
      console.error("Failed to start microphone:", err);
    }
  }

  private playAudio(pcmData: Int16Array) {
    if (!this.audioContext) return;

    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    const buffer = this.audioContext.createBuffer(1, floatData.length, 16000);
    buffer.getChannelData(0).set(floatData);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    const startTime = Math.max(this.audioContext.currentTime, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + buffer.duration;
  }

  private stopAudio() {
    this.nextStartTime = 0;
    // In a real implementation, we might want to keep track of sources to stop them
  }

  private cleanup() {
    this.processor?.disconnect();
    this.source?.disconnect();
    this.audioContext?.close();
    this.processor = null;
    this.source = null;
    this.audioContext = null;
  }

  disconnect() {
    this.session?.close();
    this.cleanup();
  }
}
