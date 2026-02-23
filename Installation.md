# Guide: How to Install Group Speed Dial Pro (Developer Mode)

Since this extension is in a purely professional private compilation stage and is not deployed yet in public extension stores, you need to manually upload the `dist` folder to your browser. Use the process appropriate for your browser type below:

---

## Google Chrome, Microsoft Edge, Brave, Opera (Chromium-based)

These are the simplest browsers to run custom code. Follow these steps:

1. Open a new tab and type in the address bar: `chrome://extensions` (or `edge://extensions`, `brave://extensions` depending on your active browser).
2. At the top right of that screen, you will see a switch that says **Developer mode**. Turn it on.
3. Three new buttons will appear at the top left. Click on the one that says **Load unpacked**.
4. A system dialog pane to upload files will appear. Navigate to the root folder of this project (`vddgroupdial`) and **select the `dist` folder**.
5. Congratulations! The extension is now correctly installed. _Tip: Pin it to the top bar clicking the puzzle icon so you can see the custom Popup_.

---

## Mozilla Firefox (Gecko-based)

Firefox has a very strict extension signature system, but testing them locally is very intuitive. You can use the `dist` folder directly or the pre-compiled `.xpi` package.

### Option 1: File `.xpi` (Permanent & Standard installation)
> [!WARNING]
> By default, standard versions of Mozilla Firefox strictly block standard installation of `.xpi` files unless they have been officially signed and verified by the Mozilla Add-ons (AMO) store. Use this installation method **only if** you are running Firefox Developer Edition, Firefox Nightly, or Firefox ESR with `xpinstall.signatures.required` set to `false` in `about:config`.

1. Open Firefox and go directly to `about:addons`.
2. Click on the tiny "Gear" icon (Tools for all add-ons) next to "Manage Your Extensions", and choose **Install Add-on From File...**.
3. A system dialog pane to upload files will appear. Navigate to the root folder of this project (`vddgroupdial`) and select the file **`vddgroupdial.xpi`**.
4. Confirm the installation when the pop-up asks for permissions. 

### Option 2: Upload source directory (Testing developers)
1. Open a new tab and type: `about:debugging#/runtime/this-firefox`
2. You will see a section named **Temporary Extensions**. Click on the prominent button that says **Load Temporary Add-on...**.
3. A system dialog pane will appear. You must enter the `vddgroupdial` folder -> then open the `dist` folder -> and explicitly open the file inside named **`manifest.json`**.
4. Excellent! Firefox now recognizes and hosts your extension temporarily. 

_**Note on Firefox Temporary Installation**: Being a "Temporary Add-on" for security reasons through Option 2, Firefox might disable the extension natively if you restart the browser. Using Option 1 (`.xpi`) bypasses this._
