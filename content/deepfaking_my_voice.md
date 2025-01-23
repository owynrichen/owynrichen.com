Title: Deepfaking My Voice
Date: 2024-01-04
Category: Ideas
Tags: Deepfake, voice, Bark
Slug: deepfaking-voice
Authors: Owyn Richen
Status: published

# Deepfaking My Voice

I've always loved music production and audio. I've also been interested in the ability of AI/ML
to clone voices, but hadn't had a chance to really try it out. The purpose of this project was
to learn a little more about the options that are out there, and how effective one-shot learning
could be.

Additionally, I thought it'd be fun to attempt to run the inference API locally and test out some
of Cloudflare's ZeroTrust networking capabilities vs. finding some cloud GPU to host these open source models.

The TLDR; is, for my open-source attempts: the results aren't that good with the few different paths I took.
That being said, it still was interesting to examine the patterns of each and what is missing.  My attempt
with the ElevenLabs API was extremely surprising and impressive, it got the closest I've heard.

## Table of Contents

[TOC]

# Open Source Models Demo

Here's a demo of the outcome, it's poor at best in both cases.

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
    <textarea id="prompt">I love Charlie, Frankie and Mama.  I also love Bobes and Chew, they are the best doggies.
    </textarea>
    <br />
    <label for="voice_name">Speaker: </label>
    <select id="voice_name">
        <option value="owyntest5">Owyn (Bark)</option>
        <option value="owyn-reference3">Owyn (OpenVoice)</option>
        <option value="en_speaker_0">Bark Speaker 0</option>
        <option value="en_speaker_1">Bark Speaker 1</option>
    </select>
    <input id="submit" type="submit" onClick="playAudio()"><span id="loading" class="material-symbols-outlined">
sync
</span>
</div>

# Voice Cloning Process

I'd say that I did more 'tinkering' than approaching this via the scientific method.  That being said,
after not having immediate luck getting something to sound like me (sadly), I attempted to setup a common
audio source for apples-to-apples one-shot training.

Ultimately, to get good results I'd likely need to build a broader corpus of my speech and corresponding
transcriptions. I may do this eventually but I'll set this aside for now.

## One-Shot Training Audio

To get a feel for my voice, here's the one-shot training audio I used. It was a combination of me reading
["I am a Bunny" by Ole Risom and Richard Scarry](https://www.goodreads.com/book/show/328439.I_Am_a_Bunny) in 
English and (poor) Spanish. Additionally I read a part of the [README of the faster-whisper repo](https://github.com/SYSTRAN/faster-whisper):

<audio controls="true">
<source src="theme/audio/owyn-reference3.mp3" type="audio/mpeg" />
Your browser does not support the audio element.
</audio>

I used it to fine-tune a [Bark model](https://github.com/serp-ai/bark-with-voice-clone) and also
[OpenVoice](https://github.com/myshell-ai/OpenVoice). I'll get into more details of those processes below.

## Bark Voice Cloning

Both the [Suno-AI](https://github.com/suno-ai/bark) repo and the [Serp-AI](https://github.com/serp-ai/bark-with-voice-clone)
fork that enables the cloning (which is what I used) have pretty good walkthroughs for how to set it up for audio generation (and fine-tuning in the Serp-AI case).

The fully generative approach that Bark employs with their standard voices yields really good voices (mostly).

That being said, I wasn't able to find a fine-tuning set that output a voice that sounded close to staying
consistent phrase-to-phrase, let alone sound like me.

For more general TTS use-cases, Bark seems like a great option, and I probably could do more trials and
fine-tuning with larger sample sets, but I didn't have success.

<audio controls="true">
<source src="https://apid.owynrichen.com/speak_as/owyntest5?prompt='Does this sound like Owyn Richen? I don't think so...Perhaps if I say I am a Bunny it will?'" type="audio/wav" />
Your browser does not support the audio element.
</audio>

## OpenVoice Voice Cloning

Feeling a bit dispondent, I looked at a few other options, but landed on OpenVoice for a second trial.
OpenVoice's approach is a bit different, it leverages more standard Text-to-speech systems (in this case
MeloTTS) and then transforms the 'color/tone' of the voice based on training data.

The results do have some characteristics that have my tone, but it reinforced to me that more needs to be
done because it didn't match my cadence/speech-patterns/etc and therefore still didn't sound like me.

<audio controls="true">
<source src="https://apid.owynrichen.com/speak_as/owyn-reference3?prompt='Does this sound like Owyn Richen? I don't think so...Perhaps if I say I am a Bunny it will?'" type="audio/wav" />
Your browser does not support the audio element.
</audio>

## ElevenLabs Voice Cloning

Given the results of the 2 open-source attempts didn't work, I figured I'd give [ElevenLabs](https://elevenlabs.io/) a try for the $5 it'd cost to test out.

I went to Voices > Add a new voice > Instant Voice Clone and used the same one-shot training audio linked above. I added a few tags (accent:American, gender: male, language:English) and a brief description and
created the voice.

Here's the output compared to a similar prompt examples for the open source models:

<audio controls="true">
<source src="theme/audio/ElevenLabs_2025-01-23T16_56_51_Owyn Richen_ivc_s50_sb89_se0_b_m2.mp3" type="audio/mpeg" />
Your browser does not support the audio element.
</audio>

Crazy! It sounds very much like me.

I haven't wired it into the API yet, but I might do that. Here's the output compared to the default API prompt above.

<audio controls="true">
<source src="theme/audio/ElevenLabs_2025-01-23T16_43_51_Owyn Richen_ivc_s50_sb75_se0_b_m2.mp3" type="audio/mpeg" />
Your browser does not support the audio element.
</audio>



# Turning The Open Source Models into an API

To enable this little demo, and to test out Cloudflare Zero Trust Tunnels, I wanted to set up this as a
little API. I run the API locally on my Desktop with my 3-generation-old GPU, and the website has access to it.

The API is a little FastAPI python app, and the source code is [owyn-voice-api](https://github.com/owynrichen/owyn-voice-api).

Ultimately it is really simple, it preloads both the Bark and OpenVoice models on startup, and runs
inference-on-demand depending on the ```/speak_as/{voice_name}``` parameter. OpenVoice only has 1 voice_name
right now ```owyn-reference3```, so the rest expect a npz file trained based on the Bark fine-tuning process.

There is a little cache that keeps previously generated prompt/voice_name wav file combos around.


## System Architecture

The API is a pretty simple system.  It uses FastAPI to scaffold up a RESTful API and
leverages the models under the covers. It stores the generated audio as a WAV on the
desktop, and serves the file back to the call.

The web client interfaces with the desktop via Cloudflare Zero Trust Tunnels to securely
expose the API while keeping the rest of the system isolated.

Here's a link to how that works: [Cloudflare Zero Trust Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/), and below is a mermaid
diagram that outlines a bit more detail about the system as a whole.

~~~mermaid
---
title: Voice API + Cloudflare Tunnels Architecture
config:
  theme: neutral
  look: handDrawn
  architecture:
    iconSize: 40
    fontSize: 12
---
architecture-beta
    group user(hugeicons:user-group)[User]
    group edge(logos:cloudflare-icon)[Cloudflare Edge]
    group local(server)[Local Machine]

    service user_request1(hugeicons:location-user-01)[User Request 1] in user
    service user_request2(hugeicons:location-user-01)[User Request 2] in user

    service page(logos:cloudflare-icon)[Demo app] in edge
    service edge_server(logos:cloudflare-icon)[Edge Server] in edge

    service fast_api(logos:fastapi)[Inference API] in local
    service bark(logos:pytorch-icon)[Bark Model] in local
    service openvoice(logos:pytorch-icon)[OpenVoice Model] in local
    service audio_cache(disk)[Audio Cache] in local
    service cloudflared(logos:cloudflare-icon)[CloudflareD Tunnel] in local

    user_request1:R <--> L:page
    user_request2:R --> L:edge_server
    edge_server:R <-- L:cloudflared
    cloudflared:R --> L:fast_api
    fast_api:R <--> L:audio_cache
    fast_api:T --> B:bark
    fast_api:B --> T:openvoice
~~~

# TODOs

Given the results are sub-par right now, there are a lot of TODOs here. The first step is to try other
TTS models to see if fine-tuning is better with those. Additionally, I can capture and provide
more samples with ground-truth transcriptions to go beyond one-shot learning.

## Other SDKs/APIs to Try
https://github.com/KoljaB/RealtimeTTS?tab=readme-ov-file#cuda-installation
https://github.com/KoljaB/RealtimeSTT
https://github.com/metavoiceio/metavoice-src

## It's Too Slow

Beyond tinkering, the ultimate goal was to recreate a little avatar that can converse, but
the TTS for this (at least on my RTX 2070) is nowhere near fast enough to be a valid approach.

One of the reasons to try out Realtime TTS (and STT) is to see if that has any performance
improvements, or if it truly is due to my old video card and I need to upgrade.

<script language="javascript">
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
