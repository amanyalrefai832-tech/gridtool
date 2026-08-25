/* ---------- mobile nav ---------- */
(function(){
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('navMenu');
  if(!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=> nav.classList.remove('open'));
  });
})();

/* ---------- scroll reveal ---------- */
(function(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  if(!('IntersectionObserver' in window)){
    items.forEach(el=>el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:.14, rootMargin:'0px 0px -40px 0px'});
  items.forEach(el=>io.observe(el));
})();

/* ---------- footer year ---------- */
(function(){
  const el = document.getElementById('year');
  if(el) el.textContent = new Date().getFullYear();
})();

/* ---------- generic copy buttons: <button class="copy-btn" data-target="elementId"> ---------- */
(function(){
  const buttons = document.querySelectorAll('.copy-btn[data-target]');
  if(!buttons.length) return;
  buttons.forEach(btn=>{
    btn.addEventListener('click', async () => {
      const target = document.getElementById(btn.dataset.target);
      if(!target) return;
      const text = 'value' in target ? target.value : target.textContent;
      try{
        await navigator.clipboard.writeText(text);
      }catch(e){
        const range = document.createRange();
        range.selectNode(target);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
      }
      const original = btn.textContent;
      btn.textContent = 'Copied';
      btn.classList.add('copied');
      setTimeout(()=>{ btn.textContent = original; btn.classList.remove('copied'); }, 1500);
    });
  });
})();

/* ---------- tabs: <button class="tab-btn" data-tab="id"> + <div class="tab-panel" id="id"> ---------- */
(function(){
  const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
  if(!tabButtons.length) return;
  tabButtons.forEach(btn=>{
    btn.addEventListener('click', () => {
      const group = btn.closest('.tabs').dataset.group;
      document.querySelectorAll(`.tab-btn[data-group-ref="${group}"]`).forEach(b=>b.classList.remove('active'));
      // fallback: use siblings within same .tabs container
      btn.parentElement.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const panelId = btn.dataset.tab;
      const panelsContainer = btn.closest('.tool-shell') || document;
      panelsContainer.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
      const panel = document.getElementById(panelId);
      if(panel) panel.classList.add('active');
    });
  });
})();

/* =========================================================
   TOOL 1 — Word & Character Counter
   ========================================================= */
(function(){
  const input = document.getElementById('wcInput');
  if(!input) return;
  const wordsEl = document.getElementById('wcWords');
  const charsEl = document.getElementById('wcChars');
  const charsNoSpaceEl = document.getElementById('wcCharsNoSpace');
  const sentencesEl = document.getElementById('wcSentences');
  const readTimeEl = document.getElementById('wcReadTime');

  function update(){
    const text = input.value;
    const trimmed = text.trim();
    const words = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s+/g,'').length;
    const sentences = trimmed === '' ? 0 : (trimmed.match(/[.!?]+/g) || []).length;
    const readTime = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));

    wordsEl.textContent = words;
    charsEl.textContent = chars;
    charsNoSpaceEl.textContent = charsNoSpace;
    sentencesEl.textContent = sentences;
    readTimeEl.textContent = readTime === 0 ? '0 min' : readTime + ' min';
  }

  input.addEventListener('input', update);
  update();
})();

/* =========================================================
   TOOL 2 — Text Case Converter
   ========================================================= */
(function(){
  const input = document.getElementById('ccInput');
  if(!input) return;
  const output = document.getElementById('ccOutput');
  const buttons = document.querySelectorAll('[data-case]');

  function toTitleCase(str){
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
  function toSentenceCase(str){
    const lower = str.toLowerCase();
    return lower.replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
  }
  function toAlternatingCase(str){
    return str.split('').map((c,i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
  }

  function applyCase(type){
    const text = input.value;
    let result = text;
    if(type === 'upper') result = text.toUpperCase();
    else if(type === 'lower') result = text.toLowerCase();
    else if(type === 'title') result = toTitleCase(text);
    else if(type === 'sentence') result = toSentenceCase(text);
    else if(type === 'alternating') result = toAlternatingCase(text);
    output.value = result;
  }

  buttons.forEach(btn=>{
    btn.addEventListener('click', () => applyCase(btn.dataset.case));
  });
  input.addEventListener('input', () => {
    if(output.dataset.lastCase) applyCase(output.dataset.lastCase);
  });
  buttons.forEach(btn=>{
    btn.addEventListener('click', () => { output.dataset.lastCase = btn.dataset.case; });
  });
})();

/* =========================================================
   TOOL 3 — Unit Converter (length, weight, temperature)
   ========================================================= */
(function(){
  const categorySel = document.getElementById('ucCategory');
  if(!categorySel) return;
  const fromSel = document.getElementById('ucFrom');
  const toSel = document.getElementById('ucTo');
  const valueInput = document.getElementById('ucValue');
  const resultEl = document.getElementById('ucResult');
  const resultSubEl = document.getElementById('ucResultSub');

  const UNITS = {
    length: {
      base: 'meters',
      items: [
        {v:'mm', l:'Millimeters', factor:0.001},
        {v:'cm', l:'Centimeters', factor:0.01},
        {v:'m',  l:'Meters', factor:1},
        {v:'km', l:'Kilometers', factor:1000},
        {v:'in', l:'Inches', factor:0.0254},
        {v:'ft', l:'Feet', factor:0.3048},
        {v:'yd', l:'Yards', factor:0.9144},
        {v:'mi', l:'Miles', factor:1609.344}
      ]
    },
    weight: {
      base: 'grams',
      items: [
        {v:'mg', l:'Milligrams', factor:0.001},
        {v:'g',  l:'Grams', factor:1},
        {v:'kg', l:'Kilograms', factor:1000},
        {v:'oz', l:'Ounces', factor:28.3495},
        {v:'lb', l:'Pounds', factor:453.592}
      ]
    },
    temperature: {
      base: 'celsius',
      items: [
        {v:'c', l:'Celsius'},
        {v:'f', l:'Fahrenheit'},
        {v:'k', l:'Kelvin'}
      ]
    }
  };

  function populateUnits(category){
    const items = UNITS[category].items;
    fromSel.innerHTML = '';
    toSel.innerHTML = '';
    items.forEach((u,i)=>{
      const opt1 = document.createElement('option');
      opt1.value = u.v; opt1.textContent = u.l;
      fromSel.appendChild(opt1);
      const opt2 = document.createElement('option');
      opt2.value = u.v; opt2.textContent = u.l;
      toSel.appendChild(opt2);
    });
    fromSel.selectedIndex = 0;
    toSel.selectedIndex = items.length > 1 ? 1 : 0;
  }

  function toCelsius(value, unit){
    if(unit === 'c') return value;
    if(unit === 'f') return (value - 32) * 5/9;
    if(unit === 'k') return value - 273.15;
    return value;
  }
  function fromCelsius(celsius, unit){
    if(unit === 'c') return celsius;
    if(unit === 'f') return celsius * 9/5 + 32;
    if(unit === 'k') return celsius + 273.15;
    return celsius;
  }

  function convert(){
    const category = categorySel.value;
    const from = fromSel.value;
    const to = toSel.value;
    const rawValue = parseFloat(valueInput.value);

    if(isNaN(rawValue)){
      resultEl.textContent = '—';
      resultSubEl.textContent = 'Enter a number to convert';
      return;
    }

    let output;
    if(category === 'temperature'){
      output = fromCelsius(toCelsius(rawValue, from), to);
    } else {
      const items = UNITS[category].items;
      const fromFactor = items.find(u=>u.v===from).factor;
      const toFactor = items.find(u=>u.v===to).factor;
      const base = rawValue * fromFactor;
      output = base / toFactor;
    }

    const rounded = Math.round(output * 1e6) / 1e6;
    resultEl.textContent = rounded.toLocaleString(undefined, {maximumFractionDigits:6});
    const fromLabel = UNITS[category].items.find(u=>u.v===from).l;
    const toLabel = UNITS[category].items.find(u=>u.v===to).l;
    resultSubEl.textContent = `${rawValue} ${fromLabel} = ${rounded.toLocaleString(undefined,{maximumFractionDigits:6})} ${toLabel}`;
  }

  categorySel.addEventListener('change', () => { populateUnits(categorySel.value); convert(); });
  fromSel.addEventListener('change', convert);
  toSel.addEventListener('change', convert);
  valueInput.addEventListener('input', convert);

  populateUnits(categorySel.value);
  valueInput.value = 1;
  convert();
})();

/* =========================================================
   TOOL 4 — Date Calculator
   ========================================================= */
(function(){
  const dateAStart = document.getElementById('dcStart');
  if(!dateAStart) return;
  const dateAEnd = document.getElementById('dcEnd');
  const diffResult = document.getElementById('dcDiffResult');
  const diffSub = document.getElementById('dcDiffSub');

  const dateBStart = document.getElementById('dcAddStart');
  const dateBDays = document.getElementById('dcAddDays');
  const addResult = document.getElementById('dcAddResult');

  function parseUTC(dateStr){
    return new Date(dateStr + 'T00:00:00Z');
  }
  function formatUTC(date){
    return date.toLocaleDateString('en-US', {weekday:'long', year:'numeric', month:'long', day:'numeric', timeZone:'UTC'});
  }

  function updateDiff(){
    if(!dateAStart.value || !dateAEnd.value){
      diffResult.textContent = '—';
      diffSub.textContent = 'Pick two dates';
      return;
    }
    const d1 = parseUTC(dateAStart.value);
    const d2 = parseUTC(dateAEnd.value);
    const totalDays = Math.round(Math.abs(d2 - d1) / 86400000);
    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;
    diffResult.textContent = totalDays + (totalDays === 1 ? ' day' : ' days');
    diffSub.textContent = `${weeks} week${weeks===1?'':'s'} and ${remDays} day${remDays===1?'':'s'}`;
  }

  function updateAdd(){
    if(!dateBStart.value || dateBDays.value === ''){
      addResult.textContent = '—';
      return;
    }
    const d = parseUTC(dateBStart.value);
    const days = parseInt(dateBDays.value, 10) || 0;
    d.setUTCDate(d.getUTCDate() + days);
    addResult.textContent = formatUTC(d);
  }

  dateAStart.addEventListener('input', updateDiff);
  dateAEnd.addEventListener('input', updateDiff);
  dateBStart.addEventListener('input', updateAdd);
  dateBDays.addEventListener('input', updateAdd);

  updateDiff();
  updateAdd();
})();

/* =========================================================
   TOOL 5 — Password Generator
   ========================================================= */
(function(){
  const lengthInput = document.getElementById('pgLength');
  if(!lengthInput) return;
  const lengthLabel = document.getElementById('pgLengthLabel');
  const output = document.getElementById('pgOutput');
  const generateBtn = document.getElementById('pgGenerate');
  const strengthBar = document.getElementById('pgStrengthBar');
  const strengthLabel = document.getElementById('pgStrengthLabel');
  const warning = document.getElementById('pgWarning');

  const checkUpper = document.getElementById('pgUpper');
  const checkLower = document.getElementById('pgLower');
  const checkNumbers = document.getElementById('pgNumbers');
  const checkSymbols = document.getElementById('pgSymbols');

  const SETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  function buildPool(){
    let pool = '';
    if(checkUpper.checked) pool += SETS.upper;
    if(checkLower.checked) pool += SETS.lower;
    if(checkNumbers.checked) pool += SETS.numbers;
    if(checkSymbols.checked) pool += SETS.symbols;
    return pool;
  }

  function generate(){
    const pool = buildPool();
    const length = parseInt(lengthInput.value, 10);

    if(!pool){
      warning.style.display = 'block';
      output.value = '';
      strengthBar.style.width = '0%';
      strengthLabel.textContent = '';
      return;
    }
    warning.style.display = 'none';

    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    let result = '';
    for(let i = 0; i < length; i++){
      result += pool[randomValues[i] % pool.length];
    }
    output.value = result;
    updateStrength(length, pool.length);
  }

  function updateStrength(length, poolSize){
    const entropy = length * Math.log2(poolSize);
    let pct, color, label;
    if(entropy < 40){ pct = 25; color = 'var(--signal)'; label = 'Weak'; }
    else if(entropy < 60){ pct = 55; color = 'var(--amber)'; label = 'Fair'; }
    else if(entropy < 80){ pct = 80; color = 'var(--good)'; label = 'Good'; }
    else { pct = 100; color = 'var(--good)'; label = 'Strong'; }
    strengthBar.style.width = pct + '%';
    strengthBar.style.background = color;
    strengthLabel.textContent = label + ' · ~' + Math.round(entropy) + ' bits of entropy';
  }

  lengthInput.addEventListener('input', () => {
    lengthLabel.textContent = lengthInput.value;
    generate();
  });
  [checkUpper, checkLower, checkNumbers, checkSymbols].forEach(el=>{
    el.addEventListener('change', generate);
  });
  generateBtn.addEventListener('click', generate);

  lengthLabel.textContent = lengthInput.value;
  generate();
})();

/* =========================================================
   TOOL 6 — Color Converter
   ========================================================= */
(function(){
  const hexInput = document.getElementById('colHex');
  if(!hexInput) return;
  const picker = document.getElementById('colPicker');
  const rInput = document.getElementById('colR');
  const gInput = document.getElementById('colG');
  const bInput = document.getElementById('colB');
  const swatch = document.getElementById('colSwatch');
  const hslOut = document.getElementById('colHslOut');
  const hexOut = document.getElementById('colHexOut');
  const rgbOut = document.getElementById('colRgbOut');

  function clamp255(n){ return Math.max(0, Math.min(255, n)); }

  function hexToRgb(hex){
    let h = hex.replace('#','').trim();
    if(h.length === 3){ h = h.split('').map(c=>c+c).join(''); }
    if(!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return {
      r: parseInt(h.substring(0,2),16),
      g: parseInt(h.substring(2,4),16),
      b: parseInt(h.substring(4,6),16)
    };
  }
  function rgbToHex(r,g,b){
    const toHex = n => clamp255(n).toString(16).padStart(2,'0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }
  function rgbToHsl(r,g,b){
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if(max === min){ h = 0; s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g-b)/d + (g<b?6:0); break;
        case g: h = (b-r)/d + 2; break;
        default: h = (r-g)/d + 4;
      }
      h /= 6;
    }
    return {h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100)};
  }

  function render(r,g,b){
    r = clamp255(r); g = clamp255(g); b = clamp255(b);
    const hex = rgbToHex(r,g,b);
    const hsl = rgbToHsl(r,g,b);
    hexInput.value = hex;
    picker.value = hex;
    rInput.value = r; gInput.value = g; bInput.value = b;
    swatch.style.background = hex;
    hexOut.textContent = hex;
    rgbOut.textContent = `rgb(${r}, ${g}, ${b})`;
    hslOut.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }

  hexInput.addEventListener('input', () => {
    const rgb = hexToRgb(hexInput.value);
    if(rgb) render(rgb.r, rgb.g, rgb.b);
  });
  picker.addEventListener('input', () => {
    const rgb = hexToRgb(picker.value);
    if(rgb) render(rgb.r, rgb.g, rgb.b);
  });
  [rInput, gInput, bInput].forEach(el=>{
    el.addEventListener('input', () => {
      render(parseInt(rInput.value)||0, parseInt(gInput.value)||0, parseInt(bInput.value)||0);
    });
  });

  render(255, 182, 72); // default: brand amber
})();
