// 着信音生成とプレイ機能
export class Ringtone {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  // 着信音開始
  public start() {
    if (!this.audioContext || this.isPlaying) return;

    this.isPlaying = true;
    this.playRingtone();
  }

  // 着信音停止
  public stop() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }
    if (this.gainNode) {
      this.gainNode = null;
    }
    this.isPlaying = false;
  }

  private playRingtone() {
    if (!this.audioContext) return;

    const playTone = (frequency: number, duration: number, delay: number = 0) => {
      setTimeout(() => {
        if (!this.isPlaying || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        // フェードイン・フェードアウト
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
      }, delay);
    };

    // iPhone風の着信音パターン
    const playSequence = () => {
      if (!this.isPlaying) return;
      
      // 第一フレーズ (高音)
      playTone(800, 0.4, 0);
      playTone(600, 0.4, 400);
      playTone(800, 0.4, 800);
      playTone(600, 0.4, 1200);

      // 休符
      setTimeout(() => {
        if (!this.isPlaying) return;
        
        // 第二フレーズ (低音)
        playTone(400, 0.6, 0);
        playTone(500, 0.6, 600);

        // 次のサイクル
        setTimeout(() => {
          if (this.isPlaying) {
            playSequence();
          }
        }, 1500);
      }, 2000);
    };

    playSequence();
  }
}

// シングルトンインスタンス
export const ringtone = new Ringtone();