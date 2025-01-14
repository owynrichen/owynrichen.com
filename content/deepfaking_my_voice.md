Title: Deepfaking My Voice
Date: 2024-01-04
Category: Ideas
Tags: Deepfake, voice, Bark
Slug: deepfaking-voice
Authors: Owyn Richen
Status: published

# Deepfaking My Voice

I wanted to see how I could deepfake my own voice and
use it to test some of Cloudflare's ZeroTrust capabilities.

Currently the deepfake is poor, but I did get to wire up
a Cloudflare Zero Trust tunnel to enable running inference
on my desktop via a webpage.

# Demo
<style>
    #loading {
        opacity: 0;
        animation: rotate 1s infinite both;
    }

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(-360deg);
        }
    }
</style>
<div>
    <label for="prompt">Prompt: </label>
    <textarea id="prompt">I love Owyn, he's so cool. I wish I could be like him, but I'll settle for washing his feet.
    </textarea>
    <br />
    <label for="voice_name">Speaker: </label>
    <select id="voice_name">
        <option value="owyntest2">Owyn2</option>
        <option value="owyntest3">Owyn3</option>
        <option value="owyntest4">Owyn4</option>
        <option value="en_speaker_0">Speaker 0</option>
        <option value="en_speaker_1">Speaker 1</option>
        <option value="en_speaker_2">Speaker 2</option>
        <option value="en_speaker_3">Speaker 3</option>
        <option value="en_speaker_4">Speaker 4</option>
        <option value="en_speaker_5">Speaker 5</option>
        <option value="en_speaker_6">Speaker 6</option>
        <option value="en_speaker_7">Speaker 7</option>
        <option value="en_speaker_8">Speaker 8</option>
        <option value="en_speaker_9">Speaker 9</option>
    </select>
    <input id="submit" type="submit" onClick="playAudio()"><span id="loading" class="material-symbols-outlined">
sync
</span>
</div>
<script language="javascript" type="module">
    function playAudio() {
        const prompt = encodeURI(document.querySelector("#prompt").value.trim());
        const voiceName = document.querySelector("#voice_name").value;
        const ctx = new AudioContext();
        const submit = document.querySelector("#submit")
        submit.disabled = true;
        const loading = document.querySelector("#loading")
        loading.style.opacity = 1;
        fetch(`https://apid.owynrichen.com/speak_as/${voiceName}?prompt="${prompt}"`)
            .then(response => {
                if (response.status != 200) {
                    throw new Error(response.body);
                }
                return response.arrayBuffer()
            })
            .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
            .then(decodedAudio => {
                const playSound = ctx.createBufferSource();
                loading.style.opacity = 0;
                submit.disabled = false;
                playSound.buffer = decodedAudio;
                playSound.connect(ctx.destination);
                playSound.start(ctx.currentTime);
            }).catch(error => {
                loading.innerText = "sync_problem";
                loading.style.animation = "";
                submit.disabled = false;
            })
    }
</script>

https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/

https://github.com/serp-ai/bark-with-voice-clone

https://github.com/suno-ai/bark