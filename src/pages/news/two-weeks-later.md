---
layout: ../../layouts/NewsPost.astro
title: "Chrome thinks it's on Windows 10"
description: "A few demos of Raven running very different applications."
date: "2026-11-09"
lang: "en"
---

Let me start with a screenshot, because it says it better than I could.

![Google Chrome running on Raven and reporting Windows 10 64-bit, next to a terminal showing Sinty OS](/assets/news/chrome-whatsmyos.png)

On the left there's Google Chrome, the real Windows build downloaded from Google, opening whatsmyos.com, which is really, really sure it's talking to Windows 10 64-bit :D On the right there's a terminal with `/etc/os-release`, and the machine is running Sinty OS. Same screen, same moment.

I laughed for a good minute, lol.

Chrome is one of the hardest programs I could pick. It's not one process, it's a small family of them: the browser, the renderers, a GPU process, a network service, the crash handler, the updater (no idea why the architecture is like that, but for sure Google knows..). They are started with handles passed down from the parent, they talk through named pipes and shared memory, and they sandbox each other to make everything more ~~complex 💀~~ secure <3. Well, if just one of these pieces does not behave exactly as it should on Windows, the whole family falls apart before even showing a single pixel :/

Is it finished? Well.. no. It still renders in software mode because the GPU renderer is not working yet.. oh, and it takes a few seconds before the first frame shows up. In other apps it's better, like in Steam, which is still CEF, so... almost there.

## Notepad++, where everything started

If you read the first post, you know that Notepad++ was the first graphical program I ever tried on Raven, back when it showed literally nothing. So it felt right to look at it again.

<video controls muted playsinline preload="metadata" poster="/assets/news/notepadpp-on-raven-poster.jpg">
  <source src="/assets/news/notepadpp-on-raven.mp4" type="video/mp4">
</video>

This is the latest build of Raven, on my desktop. Menus, toolbar, tabs, typing, the status bar updating as you write. Scintilla is still an editor inside the editor, and it still is the best test I know for how Raven handles text, fonts and painting.

## What changed in two weeks

Around 600 commits landed since my last post on this blog :D I'm not going to list all of them, I promise, but let me summarize some of them:

### Installers

This is the part I care about the most and if you've followed Bottles for a while you know why, installing a dependency should just work like it does on Windows..

So Raven now has its own Windows Installer engine with its own `msiexec`, it shows the package's own dialogs, runs the rollback and commit actions and also the custom actions written in VBScript, and since a lot of installers love running scripts I ended up writing our own VBScript and JScript engines too, with the scripting runtime and the script hosts around them. PA19 patches go through our own mspatcha and the DirectX and Visual C++ redistributables now get much further in their setups.

### Talking to other processes

Chrome isn't the only program made of several processes that need to talk to each other, so COM servers living in their own process now start and answer, even when they are services described by an AppID, programs can send messages to the windows of other processes, authenticate to each other with NTLM and TLS connections give back the server's certificate chain like on Windows, which was missing for .NET and was kind of a big deal.

### Graphics and text

`d3dcompiler_47` is now our own HLSL compiler, from Direct3D 9 effects up to shader model 5.1, GDI+, WIC, RichEdit and hlink are ours too and Direct2D batches its drawing instead of doing it one call at a time.

Text got a lot of love as well, characters a font doesn't have are drawn with fallback fonts (so way fewer boxes) and Raven's own ICU now handles right-to-left text too. Oh and for those of you on NVIDIA, the Vulkan bridge reads back much less memory on every wait, I can't test it on NVIDIA myself so please let me know if it helps.

### Bigger programs

Microsoft Word starts and shows documents in viewer mode, programs built on WebView2 run on our own WebView2 runtime made with the Chromium Embedded Framework and the old WebBrowser control uses it too. OpenMPT, PDF-XChange Editor and a .NET point-of-sale app also got a lot of fixes, all thanks to people who use them every day and took the time to tell me where they stopped.

### And the small things

There were almost two hundred fixes and most of them you'll never notice, which is kind of the point.. but a few you probably will, like the mouse wheel finally scrolling the window under the pointer, maximized windows restoring properly, `Ctrl+Alt` shortcuts working and X11 dialogs staying above their window instead of hiding behind it.

## Thanks

Thanks to everyone who opened an issue, sent a pull request or simply posted a screenshot of something that broke. Many of the things above exist because someone ran a program I'd never tried and told me exactly where it stopped. Keep them coming: every report is a configuration I don't have.

And if you try Chrome on Raven, be patient for those first few seconds. It's worth it, lol.

_Mirko_
