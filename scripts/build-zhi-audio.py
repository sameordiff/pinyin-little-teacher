"""Create zhi component listening clips from the attributed CC BY-SA 3.0 source recordings."""
from pathlib import Path
import subprocess,json
root=Path(__file__).resolve().parent.parent/'public'
segments=[('zh-initial','zhi1',0.28,0.44),('zhi-vowel1','zhi1',0.38,0.78),('zhi-vowel2','zhi2',0.40,0.75),('zhi-vowel3','zhi3',0.37,1.03),('zhi-vowel4','zhi4',0.40,0.65)]
for name,source,start,end in segments:
    duration=end-start
    filters=f'atrim=start={start}:end={end},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.003,afade=t=out:st={duration-0.008}:d=0.008,adelay=60,apad=pad_dur=0.18,asetpts=N/SR/TB'
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(root/'audio'/f'{source}.mp3'),'-af',filters,'-codec:a','libmp3lame','-b:a','96k','-metadata','license=CC-BY-SA-3.0','-metadata','artist=Chen Wang 王琛','-metadata',f'title={name} (cropped from {source}, fades and silence padding added)','-metadata','comment=Source: https://github.com/hugolpz/audio-cmn ; original authors Wang Chen, Lopez Hugo, Vion Nicolas; adapted for component listening.',str(root/'audio'/f'{name}.mp3')],check=True)
index=root/'audio-index.js'
keys=json.loads(index.read_text().split('=',1)[1].strip().rstrip(';'))
keys=sorted(set(keys)|{s[0] for s in segments})
index.write_text('window.PINYIN_AUDIO = '+json.dumps(keys)+';\n')
(root/'audio'/'segments.json').write_text(json.dumps({'source':'https://github.com/hugolpz/audio-cmn','authors':['Chen Wang 王琛','Hugo Lopez','Nicolas Vion'],'license':'CC-BY-SA-3.0','license_url':'https://creativecommons.org/licenses/by-sa/3.0/','changes':'Cropped consonant and syllabic retroflex vowel portions; short edge fades and silence padding; no pitch alteration. These are component listening clips, not new teacher recordings.','segments':[{'file':n+'.mp3','source_file':f+'.mp3','start_seconds':a,'end_seconds':b}for n,f,a,b in segments]},ensure_ascii=False,indent=2)+'\n')
print('Created 5 component clips with source and adaptation credits.')
