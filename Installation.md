# Guide: How to Install Group Speed Dial Pro (Developer Mode)

Since this extension is in a purely professional private compilation stage and is not deployed yet in public extension stores, you need to manually upload the `dist` folder to your browser. Use the process appropriate for your browser type below:

---

## Google Chrome, Microsoft Edge, Brave, Opera (Chromium-based)

These are the simplest browsers to run custom code. Follow these steps:

1. Open a new tab and type in the address bar: `chrome://extensions` (or `edge://extensions`, `brave://extensions` depending on your active browser).
2. At the top right of that screen, you will see a switch that says **Developer mode**. Turn it on.
3. Three new buttons will appear at the top left. Click on the one that says **Load unpacked**.
4. A system dialog pane to upload files will appear. Navigate to the root folder of this project (`groupspeeddial`) and **select the `dist` folder**. 
5. Congratulations! The extension is now correctly installed. _Tip: Pin it to the top bar clicking the puzzle icon so you can see the custom Popup_.

---

## Mozilla Firefox (Gecko-based)

Firefox has a very strict extension signature system, but testing them locally is very intuitive. 

1. Open a new tab and type: `about:debugging#/runtime/this-firefox`
2. You will see a section named **Temporary Extensions**. Click on the prominent button that says **Load Temporary Add-on...**.
3. A system dialog pane will appear. Instead of a whole folder like in Chrome, you must enter the `groupspeeddial` folder -> then open the `dist` folder -> and explicitly open the file inside named **`manifest.json`**.
4. Excellent! Firefox now recognizes and hosts your extension temporarily. 

_**Note on Firefox**: Being a "Temporary Add-on" for security reasons, Firefox might disable the extension natively if you restart the browser. If it is removed, you will have to repeat step 2 manually when deploying development code._
