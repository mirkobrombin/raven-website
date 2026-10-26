---
layout: ../../layouts/NewsPost.astro
title: "Raven now speaks X11"
description: "An experimental X11 desktop, why I changed my mind about Xorg and what got fixed since the first announcement."
date: "2026-10-26"
lang: "en"
---

In the first announcement I wrote that I didn't want to work on Xorg, because in 2026 it seemed like an enormous waste of energy to me. Well... it took two days for someone to ask for it.

[probonopd opened an issue](https://github.com/mirkobrombin/raven/issues/10) asking for an X11 build option for systems without Wayland. And honestly, he's right. I can think whatever I want about Xorg, but there are still a lot of people using it every day: on older machines, on desktops that never moved to Wayland, on setups that simply work and that nobody wants to touch. Telling them "Raven runs graphical programs, but not on your session" didn't make much sense.

So I changed my mind. Partly, lol.

## Not a second Raven

The good news is that the C++ rewrite had already done most of the work. When I moved away from Go, I separated what a Windows program asks for from how it ends up on the screen: USER32 and GDI talk to a presentation layer, and that layer is the only part that knows about Wayland.

This time I didn't have to write the protocol by hand, I promise. The X11 desktop uses libxcb, and the presentation layer got a second backend next to the Wayland one. The program doesn't know anything about it: it creates its windows, draws them and reads the mouse and keyboard exactly like before.

What the X11 backend handles today:

- **Windows and drawing**: the contents Raven draws are sent to the X server, and the windows are moved, resized, maximized and closed like on Wayland.
- **Keyboard**: through the XKB extension and xkbcommon-x11, so the layout is the one of your session and not a guess.
- **Mouse**: normal movement, raw movement through XInput for games that want it, and pointer confinement when a program keeps the mouse inside its window.
- **Clipboard**: copy and paste work in both directions with the other X11 applications.
- **Menus and popups**: they open where the program expects them and close when you click elsewhere.
- **Graphics**: Vulkan and EGL surfaces on X11 windows, so Direct3D through DXVK and the native OpenGL bridge present on X11 too.

## How to try it

On an X11 session, `--desktop=x11` takes the place of `--desktop=wayland`. That's it.

To build it you need libxcb with its xkb, xfixes and xinput extensions, and xkbcommon-x11. If you don't want Wayland at all, `-DRAVEN_DESKTOP_WAYLAND=OFF` builds Raven without it.

Now, the important part: **it's experimental**. The tests run on Xvfb with Openbox, and they check that windows cover the screen when maximized, that the OpenGL bridge frames reach the screen and that a Direct3D 11 swap chain shows the last frame the GPU produced, before and after a resize. These checks tell me the backend draws the right things, not how fast it does it, because Xvfb renders in software.

I also haven't tried it on many real X11 desktops yet. So if you're on X11, try it and tell me where it stops: open an issue with your distribution, desktop, GPU and the command you ran.

## What changed since the first announcement

It's only been a few days, but a lot happened. I won't list every single commit, here are the ones that matter if you're trying Raven:

### New

- An experimental **X11 desktop**, the one this post is about.
- A **native OpenGL bridge**, which gives 64-bit programs OpenGL through the host's EGL instead of a guest build of the libraries. For now you turn it on with `RAVEN_NATIVE_OPENGL=1`.
- **Parallel guest execution**, with shared Windows process state, so the threads of a program can run at the same time instead of waiting in line. It's opt-in with `RAVEN_PARALLEL=1`.
- **Per-thread graphics queues**, on top of parallel execution and opt-in too, with `RAVEN_QUEUED_GRAPHICS=1`.
- **Process enumeration and the ETW controller APIs**, which some launchers check before starting.

### Fixed

- The Windows calls Inno Setup, 7-Zip and VLC make, and the C runtime gaps VLC and Audacity import.
- TLS slot zero is now reserved for the executable, as programs expect.
- Thread context is preserved while Raven serves an API call.
- Desktop dimensions and GPU surface resizes are kept in sync.
- Waiting for window messages no longer polls in a loop.
- Runtime dependencies are resolved while setting up a prefix.
- Shared waits and semaphore wakeups.
- Handles and security tokens survive when they're passed to another process.
- Menu popup input that arrived through a queue status check was lost.
- The OpenGL export tables now hand out real function addresses.
- Setting an event through a file handle reports a type mismatch, like Windows does.
- `LoadStringW` stores a 32-bit pointer in 32-bit processes.

### Building

Several of you couldn't build Raven, and that was on me. It now builds with the MinGW and Vulkan headers your distribution ships, with newer MinGW toolchains, and when the compiler is reached through a wrapper. Thanks to everyone who opened an issue with the full build log: that's exactly what I needed.

### The project

- The legacy Go runtime is gone from the repository. It did its job, may it rest in peace.
- The host is now licensed under GPLv3 or later, while the guest components keep the licences of their upstream projects.
- There are [contribution guidelines](https://github.com/mirkobrombin/raven/blob/main/CONTRIBUTING.md), including the rules on what material can be used to implement Windows behaviour. Please read them before sending a pull request.

## Thanks

Thanks to probonopd for asking, and for reminding me that "nobody uses it anymore" is never true. And thanks to everyone who tried Raven, posted benchmarks and opened issues in these first days: every report shows me a configuration I don't have.

_Mirko_
