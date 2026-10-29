"""ARCHIVED EXPERIMENT. Not used in current teaching; kept for provenance only."""
from pathlib import Path
import subprocess

audio = Path(__file__).resolve().parent.parent / 'public' / 'audio'
# Source chi2 has a naturally sustained ch release/aspiration; vowel begins ~0.485s.
start, end = 0.275, 0.482
duration = end - start
filters = (
    f'atrim=start={start}:end={end},asetpts=PTS-STARTPTS,volume=1.1,'
    f'afade=t=in:st=0:d=0.002,afade=t=out:st={duration-0.006}:d=0.006,'
    'adelay=40,apad=pad_dur=0.20,asetpts=N/SR/TB'
)
subprocess.run([
    'ffmpeg', '-v', 'error', '-y', '-i', str(audio / 'chi2.mp3'),
    '-af', filters, '-codec:a', 'libmp3lame', '-b:a', '96k',
    '-metadata', 'license=CC-BY-SA-3.0',
    '-metadata', 'artist=Chen Wang 王琛',
    '-metadata', 'title=ch initial (consonant and aspiration extracted from chi2)',
    '-metadata', 'comment=Source https://github.com/hugolpz/audio-cmn ; onset cropped, gain +0.83dB, short fades and silence padding; no pitch alteration.',
    str(audio / 'ch-initial-clear.mp3')
], check=True)
