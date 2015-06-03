naab.chrome:
	rm -rf "build/naab.chrome.v$(VERSION)"
	rm -rf "build/naab.chrome.v$(VERSION).crx"

	mkdir -p build
	cp -rp chrome "build/naab.chrome.v$(VERSION)"

	# Replace symlinks with the actual directories
	rm "build/naab.chrome.v$(VERSION)/css"
	rm "build/naab.chrome.v$(VERSION)/js"
	cp -rp src/js "build/naab.chrome.v$(VERSION)"
	cp -rp src/css "build/naab.chrome.v$(VERSION)"

	# Replace 0.0.0 placeholder with the VERSION environment variable
	find "build/naab.chrome.v$(VERSION)" -type f -print0 | xargs -0 sed -i -e 's/0.0.0/$(VERSION)/g'
	"$(CHROME_BIN)" --pack-extension="./build/naab.chrome.v$(VERSION)" --pack-extension-key=./naab.pem

all: naab.chrome
