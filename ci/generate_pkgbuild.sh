#!/bin/bash
cat << EOF > PKGBUILD
pkgname=journalio
pkgver=${RELEASE_TAG}
pkgrel=1
pkgdesc="JournalIO is a WYSIWYG markdown editor designed for writing daily and weekly journals."
arch=('x86_64')
url="https://github.com/Forest0923/journalio"
license=('mit')
depends=('cairo' 'desktop-file-utils' 'gdk-pixbuf2' 'glib2' 'gtk3' 'hicolor-icon-theme' 'libsoup' 'pango' 'webkit2gtk')
options=('!strip' '!emptydirs')
install=\$pkgname.install
source_x86_64=("https://github.com/Forest0923/journalio/releases/download/v\$pkgver/Journalio_"\$pkgver"_amd64.deb")
sha256sums_x86_64=('SKIP')
package() {
	tar -xz -f data.tar.gz -C "\$pkgdir"
}
EOF
