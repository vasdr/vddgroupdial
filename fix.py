import codecs

with codecs.open('e:/Proyectos/groupspeeddial/index.html', 'r', 'utf-8') as f:
    text = f.read()

start_idx = text.find('                <div>\r\n                  <label class="adv-radio-label"><span style="display:flex; align-items:center; gap:0.5rem;"><input\r\n                        type="radio" name="dg" class="adv-radio"> Cuadrícula</span></label>')
if start_idx == -1:
    start_idx = text.find('                <div>\n                  <label class="adv-radio-label"><span style="display:flex; align-items:center; gap:0.5rem;"><input\n                        type="radio" name="dg" class="adv-radio"> Cuadrícula</span></label>')

end_str = '<!-- APARIENCIA TAB -->'
end_idx = text.find(end_str, max(0, start_idx))

if start_idx != -1 and end_idx != -1:
    # Need to go back to the closing div of GENERAL TAB. 
    # End of general tab is  "            </div>\r\n\r\n            <!-- APARIENCIA TAB -->"
    actual_end = text.rfind('              </div>\n            </div>', start_idx, end_idx)
    if actual_end == -1:
        actual_end = text.rfind('              </div>\r\n            </div>', start_idx, end_idx)
    
    if actual_end != -1:
        new_block = '''                <div style="background: rgba(14, 165, 233, 0.05); padding: 1rem; border-radius: 4px; border: 1px solid rgba(14, 165, 233, 0.2); margin-top: 0.5rem;">
                  <label class="adv-radio-label"><span style="display:flex; align-items:center; gap:0.5rem; font-weight: 500; color: #0ea5e9;"><input type="radio" name="dg" class="adv-radio" checked> Cuadrícula</span></label>
                  
                  <div style="display: flex; flex-direction: column; gap: 1rem; padding-left: 2rem; margin-top: 1rem;">
                    <label style="display:flex; align-items:center; justify-content: space-between; cursor:pointer;">
                      <span style="display:flex; align-items:center; gap:0.5rem;"><input type="radio" name="dg_sub" checked class="adv-radio"> Rellenar hueco</span>
                      <span style="background:rgba(255,255,255,0.1); width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold; color: var(--text-secondary);">?</span>
                    </label>

                    <label style="display:flex; align-items:center; justify-content: space-between; cursor:pointer;">
                      <span style="display:flex; align-items:center; gap:0.5rem;"><input type="radio" name="dg_sub" class="adv-radio"> Centrar diapositivas</span>
                      <span style="display:flex; align-items:center; gap:1rem; font-size:0.85rem;">
                        Relación de aspecto de la diapositiva:
                        <div class="adv-input-group">
                          <input type="text" value="16" style="width:30px; text-align:center; border:none; background:transparent; color:white; font-family:monospace;">
                          <div style="width:12px; display:flex; flex-direction:column;"><button class="btn-spinner" style="font-size:6px; padding:0;">▲</button><button class="btn-spinner" style="font-size:6px; padding:0;">▼</button></div>
                        </div>
                        :
                        <div class="adv-input-group">
                          <input type="text" value="12" style="width:30px; text-align:center; border:none; background:transparent; color:white; font-family:monospace;">
                          <div style="width:12px; display:flex; flex-direction:column;"><button class="btn-spinner" style="font-size:6px; padding:0;">▲</button><button class="btn-spinner" style="font-size:6px; padding:0;">▼</button></div>
                        </div>
                      </span>
                    </label>
                  </div>
                </div>\n'''
        if '\r\n' in text:
            new_block = new_block.replace('\n', '\r\n')
            
        with codecs.open('e:/Proyectos/groupspeeddial/index.html', 'w', 'utf-8') as f:
            f.write(text[:start_idx] + new_block + text[actual_end:])
        print("Successfully replaced!")
    else:
        print("Actual end not found", end_idx)
else:
    print("Not found", start_idx, end_idx)
