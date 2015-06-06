# NAAB

NAAB (Not Another Army Builder) is a browser extension that enhances the ["Army 5" Army Builder](http://infinitythegame.com/army/) for [Infinity](http://infinitythegame.com/) by fixing bugs and adding and enhancing features to it.

At the moment NAAB only supports Google Chrome and Chromium.

You can [install the extension from the Chrome Web Store](https://chrome.google.com/webstore/detail/naab/hlphhcdmfneaflnhcbofelmdgoboampf)

## Wait, ...what?

Infinity is a tabletop miniature wargame designed and published by a company called [Corvus Belli](infinitythegame.com/). As a value adding service Corvus Belli has also created a web application commonly known as Army5 to make it easier to build army lists for Infinity.

As great as Infinity and Corvus Belli are, Army5 is flawed to a point where a number of competing fan-made army builders have cropped up over the years. NAAB is not completely unlike these other army builders, but rather than being a separate application itself it simply tries to reach to the low-hanging fruit and fix the issues in Army5 directly.

## How?

When you open the army builder with NAAB installed, it will inject a bootstrap script to the page. That bootstrap script connects to Amazon S3, looks up the current version of the extension, and injects the appropriate scripts and stylesheets to the page.

By and large NAAB works by simply replacing the functions defined in Army5 with its own wrappers that change and enhance the default functionality.

## Goals

Our hope is that NAAB is a temporary solution to a temporary problem, that one day Army5 reaches a sufficient quality by itself to render this extension unnecessary.

## Risks

There is a fair chance that NAAB will be broken often. Since changes to Army5 are unnannounced, the extension has no chance but to reactively try and keep up. This is also why the main assets of the extension are hosted rather than bundled in the extension; updates and fixes can be deployed without requiring updates to the extension itself.

## Browser support

At the moment NAAB only supports Google Chrome and Chromium. Support for other browsers is coming if this project gains sufficient traction.

## Features

### 1. Better unit list

NAAB replaces the unit list of a given army/sectorial with its own. This unit list is rendered to the left-hand-side of the screen, does NOT display the unit's logo and does not have a gimmicky scrolling. In summary NAAB's unit list is pleasant to use.

### 2. BS and CC weapons visible in the army list

In addition to the unit's profile name and cost, NAAB will also show the unit's BS and CC weapons in the army list. No guessing!

### 3. Switchable profiles

NAAB allows you to select the units in your army list, and switch their profile without having to add the new profile to the end of the list and removing the previous one.

## Bug Fixes

In addition to adding new features, NAAB also tries to fix bugs where appropriate.

### A. Removes the sticky yellow highlight when moving units around

## Contributing

Community contributions are welcome! To contribute:

1. Agree to release your work in the public domain
2. Fork this repository
3. Pull request your changes against the master branch in this repository

As a general guideline, try to:

1. Err on the side of too many or too verbose commenting
2. Stick to the coding standards you see in the extension
3. Test your code thoroughly before submitting PRs
4. Ensure the branch you're PRing from is up to date with the master branch of this repository

## Development

### Browser Extensions

Clone this repository.

#### Google Chrome

1. Open chrome://extensions
2. Enable Developer Mode 
3. Load the "chrome.ext" directory as an "unpacked extension"

### NAAB scripts/stylesheets

1. Serve the project's root directory locally somehow (I use the [local-web-server](https://www.npmjs.com/package/local-web-server) for this
2. Open chrome://extensions
3. Click "Options" under NAAB, switch mode to Development and adjust the Dev URL to suite your setup

## License

NAAB is released to the public domain. Do whatever you want with it.
