# JournalIO

> **Notice:**
>
> This project was archived and no longer maintained.
> I created JournalIO because I needed an Obsidian-like WYSIWYG markdown editor that can be used freely for work.
> Obsidian required a license for commercial use before, but now it is free for commercial use (https://obsidian.md/blog/free-for-work/).

JournalIO is a WYSIWYG markdown editor designed for writing daily and weekly journals. It is built with Tauri, React, and Typescript.

## Example

![JournalIO](./journalio_example.png)

## Install

This application is only tested on Linux and MacOS for now.

- Arch

```bash
paru -S journalio
# or
yay -S journalio
```

- MacOS

```bash
brew tap Forest0923/tap
brew install journalio
```

- Build from source

```bash
git clone https://github.com/Forest0923/journalio.git
cd journalio
yarn install
yarn tauri build
```

### Troubleshooting

If you get an error like this:

```text
...
    Bundling JournalIO_0.1.0_amd64.AppImage (/WORKSPACE/journalio/src-tauri/target/release/bundle/appimage/JournalIO_0.1.0_amd64.AppImage)
failed to bundle project: error running build_appimage.sh: `failed to run /WORKSPACE/journalio/src-tauri/target/release/bundle/appimage/build_appimage.sh`
    Error failed to bundle project: error running build_appimage.sh: `failed to run /WORKSPACE/journalio/src-tauri/target/release/bundle/appimage/build_appimage.sh`
```

Add environment variable NO_STRIP=true to the build command or export it before running the build command.

```bash
NO_STRIP=true yarn tauri build
```

Ref: https://github.com/tauri-apps/tauri/issues/8929

## Development

```bash
yarn tauri dev
```
