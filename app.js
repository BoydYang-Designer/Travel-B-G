// ═══════════════════════════════════════════
// DEFAULT DATA
// ═══════════════════════════════════════════
const DEFAULT_DATA = {"title":"🏝 澎湖三日遊","subtitle":"4/26（五）— 4/28（日）· 鎖港郵局會館","days":[{"label":"Day 1 · 4/26（五）","theme":"抵達 · 夜遊市區","stops":[{"name":"✈️ 澎湖機場","depart":"18:10","stay":0,"note":""},{"name":"🏨 鎖港郵局會館","depart":"18:50","stay":20,"note":""},{"name":"🍽 新村美食館","depart":"20:30","stay":90,"note":""},{"name":"🛍 市區中正路商圈","depart":"21:15","stay":45,"note":""},{"name":"🏨 鎖港郵局會館","depart":"21:35","stay":0,"note":"抵達・休息"}],"drives":[20,10,5,20]},{"label":"Day 2 · 4/27（六）","theme":"西嶼半日遊 · 花火節","stops":[{"name":"🥐 文康街早餐","depart":"09:00","stay":0,"note":""},{"name":"🐠 澎湖水族館","depart":"10:40","stay":75,"note":""},{"name":"🌊 摩西分海","depart":"12:40","stay":90,"note":""},{"name":"🍜 西嶼午餐","depart":"14:30","stay":70,"note":""},{"name":"🗿 西嶼景點","depart":"16:15","stay":95,"note":"大菓葉・鯨魚洞"},{"name":"🏨 鎖港郵局會館","depart":"18:20","stay":90,"note":"梳洗"},{"name":"🎆 觀音亭花火節","depart":"21:40","stay":200,"note":""},{"name":"🏨 鎖港郵局會館","depart":"22:00","stay":0,"note":"抵達・休息"}],"drives":[25,30,40,10,35,10,20]},{"label":"Day 3 · 4/28（日）","theme":"古蹟探訪 · 返程","stops":[{"name":"🏨 鎖港郵局會館","depart":"09:15","stay":0,"note":""},{"name":"🏛 舊郵便局（澎湖水下文化遺產博物館）","depart":"11:20","stay":125,"note":""},{"name":"🛍 午餐與伴手禮","depart":"12:45","stay":85,"note":""},{"name":"✈️ 澎湖機場","depart":"13:25","stay":0,"note":"班機 15:30"}],"drives":[15,5,40]}]};

const STORAGE_KEY = 'itinerary_data';

// ═══════════════════════════════════════════
// LOAD / SAVE (localStorage)
// ═══════════════════════════════════════════
function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('無法讀取 localStorage，使用預設資料', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showToast('💾 已儲存至本機！');
    document.getElementById('export-menu').classList.remove('open');
  } catch (e) {
    showToast('⚠️ 儲存失敗，請確認瀏覽器設定');
    console.error('localStorage 寫入失敗', e);
  }
}

// 初始化資料
let data = loadData();

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minutesToTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function stayLabel(mins) {
  if (!mins) return null;
  if (mins < 60) return `停留 ${mins} 分鐘`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `停留 ${h} 小時 ${m} 分` : `停留 ${h} 小時`;
}
function recalcTimes(dayIdx, fromIdx) {
  const day = data.days[dayIdx];
  const start = (fromIdx !== undefined) ? fromIdx : 0;
  for (let i = start; i < day.stops.length - 1; i++) {
    const leaveMins   = timeToMinutes(day.stops[i].depart);
    const driveMins   = day.drives[i] || 0;
    const nextArrMins = leaveMins + driveMins;
    const nextStay    = day.stops[i + 1].stay || 0;
    day.stops[i + 1].depart = minutesToTime(nextArrMins + nextStay);
  }
}

// ═══════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════
function renderAll() {
  document.getElementById('nav-title-text').textContent = data.title;
  document.getElementById('header-title').innerHTML = `${data.title} <span style="font-size:0.8rem;color:var(--sky);font-weight:400">✏️</span>`;
  document.getElementById('trip-subtitle').innerHTML = `${data.subtitle} <span style="font-size:0.75rem">✏️</span>`;
  document.title = data.title.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim() + ' · 互動行程';
  renderItinerary();
}

function renderItinerary() {
  const container = document.getElementById('days-container');
  container.innerHTML = '';

  data.days.forEach((day, di) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.innerHTML = `
      <div class="day-header">
        <span class="day-badge" onclick="editDay(${di})" title="點擊編輯天數資訊">🗓 ${day.label} <span style="font-size:0.65rem;opacity:0.7">✏️</span></span>
        <span class="day-theme-tag" onclick="editDay(${di})">${day.theme}</span>
        <div class="day-header-actions">
          <button class="day-map-btn" id="mapbtn-${di}" onclick="toggleInlineMap(${di})">🗺 導航</button>
          <button class="day-delete-btn" onclick="deleteDay(${di})" title="刪除此天">✕</button>
        </div>
      </div>
      <div class="stops" id="stops-${di}"></div>
      <button class="add-stop-btn" onclick="addStop(${di})">＋ 新增景點</button>
      <div class="day-inline-map" id="inline-map-${di}">
        <div class="day-map-iframe-wrap" id="map-iframe-wrap-${di}"></div>
        <div class="day-map-footer">
          <div class="day-map-stops-preview" id="map-chips-${di}"></div>
          <a class="day-map-gmaps-btn" id="gmaps-btn-${di}" href="#" target="_blank">🗺 在 Google Maps 開啟</a>
        </div>
      </div>
    `;
    container.appendChild(card);
    renderStops(di);
  });
}

function renderStops(di) {
  const day = data.days[di];
  const container = document.getElementById(`stops-${di}`);
  container.innerHTML = '';

  day.stops.forEach((stop, si) => {
    const isLast = si === day.stops.length - 1;
    const row = document.createElement('div');
    row.className = `stop-row${isLast ? ' last' : ''}`;

    let arriveTag = '';
    if (si > 0) {
      const prevStop = day.stops[si - 1];
      const drive = day.drives[si - 1] || 0;
      const arrMins = timeToMinutes(prevStop.depart) + drive;
      arriveTag = `<span class="tag tag-arrive">抵達 ${minutesToTime(arrMins)}</span>`;
    }

    const leaveTag = !isLast
      ? `<span class="tag tag-leave">離開 ${stop.depart}</span>`
      : `<span class="tag tag-arrive">抵達 ${stop.depart}</span>`;

    const noteTag = stop.note ? `<span class="tag tag-note">${stop.note}</span>` : '';

    row.innerHTML = `
      <div class="stop-left">
        <div class="stop-num">${si + 1}</div>
        <div class="stop-line"></div>
      </div>
      <div class="stop-content" onclick="editStop(${di},${si})">
        <div class="stop-name">${stop.name} <span class="edit-icon">✏️</span></div>
        <div class="stop-meta">${arriveTag}${leaveTag}${noteTag}</div>
      </div>
      <div class="stop-move-wrap">
        <button class="stop-move-btn" onclick="moveStop(${di},${si},-1)" title="上移" ${si === 0 ? 'disabled' : ''}>▲</button>
        <button class="stop-move-btn" onclick="moveStop(${di},${si},1)" title="下移" ${isLast ? 'disabled' : ''}>▼</button>
      </div>
      <button class="stop-delete" onclick="deleteStop(${di},${si})" title="刪除">✕</button>
    `;
    container.appendChild(row);

    if (!isLast) {
      const tr = document.createElement('div');
      tr.className = 'transit-row';
      tr.innerHTML = `
        <div class="transit-left">
          <div class="transit-line-top"></div>
          <div class="transit-icon-wrap">🚗</div>
          <div class="transit-line-bot"></div>
        </div>
        <div class="transit-info">
          <span class="transit-dur" onclick="editDrive(${di},${si})" title="點擊編輯車程">約 ${day.drives[si]} 分鐘 ✏️</span>
        </div>
      `;
      container.appendChild(tr);
    }
  });
}

// ═══════════════════════════════════════════
// MAP — 獨立地圖頁（切換時讀取最新 data）
// ═══════════════════════════════════════════
let currentMapDay = 0;

function buildMapURL(dayIdx) {
  const stops  = data.days[dayIdx].stops;
  const places = stops.map(s => _stopToPlace(s.name));
  if (places.length < 2) return '';
  const origin      = encodeURIComponent(places[0]);
  const destination = encodeURIComponent(places[places.length - 1]);
  const waypoints   = places.slice(1, -1).map(p => encodeURIComponent(p)).join('|');
  let url = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&origin=${origin}&destination=${destination}&mode=driving&language=zh-TW`;
  if (waypoints) url += `&waypoints=${waypoints}`;
  return url;
}

function renderMap() {
  // 確保 currentMapDay 不超出範圍（天數可能被刪除）
  if (currentMapDay >= data.days.length) currentMapDay = 0;

  const tabsEl = document.getElementById('map-tabs');
  tabsEl.innerHTML = '';
  data.days.forEach((day, di) => {
    const btn = document.createElement('button');
    btn.className = `map-day-tab${di === currentMapDay ? ' active' : ''}`;
    btn.textContent = `Day ${di + 1}`;
    btn.onclick = () => { currentMapDay = di; renderMap(); };
    tabsEl.appendChild(btn);
  });

  const day   = data.days[currentMapDay];
  const stops = day.stops;
  const drives = day.drives;
  const mapURL = buildMapURL(currentMapDay);

  let listHTML = stops.map((s, i) => {
    const driveAfter = i < drives.length ? `<span class="map-drive-time">↓ 約 ${drives[i]} 分</span>` : '';
    return `
      <div class="map-stop-item">
        <div class="map-num">${i + 1}</div>
        <div class="map-stop-name">${s.name}</div>
        <div style="font-size:0.75rem;color:var(--mid)">${s.depart}</div>
      </div>
      ${driveAfter ? `<div style="padding:0 0 0 32px;font-size:0.72rem;color:var(--sky);margin-bottom:2px">${driveAfter}</div>` : ''}
    `;
  }).join('');

  const places = stops.map(s => _stopToPlace(s.name));
  const navURL = `https://www.google.com/maps/dir/${places.map(p => encodeURIComponent(p)).join('/')}`;

  document.getElementById('map-content').innerHTML = `
    <div class="map-container">
      <iframe src="${mapURL}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
    <div class="map-stop-list">
      <h4>📍 Day ${currentMapDay + 1} 路線景點</h4>
      ${listHTML}
      <a href="${navURL}" target="_blank" class="map-open-btn">🗺 在 Google Maps 開啟導航</a>
    </div>
  `;
}

// ═══════════════════════════════════════════
// INLINE MAP — Day 卡片內展開
// ═══════════════════════════════════════════
const _mapOpen = {};

function _stopToPlace(stopName) {
  const clean = stopName.replace(/[\u{1F300}-\u{1FFFF}\u2600-\u27BF\uFE00-\uFE0F\u{1F900}-\u{1F9FF}]/gu, '').trim();
  if (/澎湖|馬公|西嶼|湖西|白沙|望安|七美/.test(clean)) return clean;
  return clean + ' 澎湖';
}

function _buildInlineMapURL(di) {
  const day    = data.days[di];
  const places = day.stops.map(s => _stopToPlace(s.name));

  if (places.length < 2) return '';
  const origin      = encodeURIComponent(places[0]);
  const destination = encodeURIComponent(places[places.length - 1]);
  const waypoints   = places.slice(1, -1).map(p => encodeURIComponent(p)).join('|');
  let url = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&origin=${origin}&destination=${destination}&mode=driving&language=zh-TW`;
  if (waypoints) url += `&waypoints=${waypoints}`;
  return url;
}

function _buildNavURL(di) {
  const places = data.days[di].stops.map(s => _stopToPlace(s.name));
  return `https://www.google.com/maps/dir/${places.map(p => encodeURIComponent(p)).join('/')}`;
}

function _renderInlineMap(di) {
  const day      = data.days[di];
  const mapURL   = _buildInlineMapURL(di);
  const navURL   = _buildNavURL(di);

  document.getElementById(`map-iframe-wrap-${di}`).innerHTML =
    mapURL
      ? `<iframe src="${mapURL}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
      : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:0.82rem;color:var(--mid)">景點不足，無法顯示地圖</div>`;

  document.getElementById(`map-chips-${di}`).innerHTML = day.stops.map((s, i) => {
    const name = s.name.replace(/[\u{1F300}-\u{1FFFF}\u2600-\u27BF\uFE00-\uFE0F\u{1F900}-\u{1F9FF}]/gu, '').trim();
    const label = name.length > 7 ? name.slice(0, 7) + '…' : name;
    return `<span class="day-map-stop-chip">
      <span class="day-map-stop-chip-num">${i + 1}</span>${label}
    </span>`;
  }).join('');

  document.getElementById(`gmaps-btn-${di}`).href = navURL;
}

function toggleInlineMap(di) {
  const panel = document.getElementById(`inline-map-${di}`);
  const btn   = document.getElementById(`mapbtn-${di}`);
  const isOpen = _mapOpen[di];

  if (isOpen) {
    panel.classList.remove('open');
    btn.textContent = '🗺 導航';
    _mapOpen[di] = false;
  } else {
    _renderInlineMap(di);
    panel.classList.add('open');
    btn.textContent = '✕ 收起';
    _mapOpen[di] = true;
    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }
}

function openDayMap(di) {
  window.open(_buildNavURL(di), '_blank');
}

function jumpToMap(di) {
  currentMapDay = di;
  showPage('map');
}

// ═══════════════════════════════════════════
// EDIT STOP
// ═══════════════════════════════════════════
let editTarget = null;
function editStop(di, si) {
  editTarget = { di, si };
  const stop = data.days[di].stops[si];
  document.getElementById('edit-name').value = stop.name;
  document.getElementById('edit-note').value = stop.note || '';
  document.getElementById('edit-depart').value = stop.depart;
  document.getElementById('edit-stay').value = stop.stay || '';
  document.getElementById('stop-modal').classList.add('open');
  updateModalHint();
}

function getArrivalMins() {
  if (!editTarget) return null;
  const { di, si } = editTarget;
  const day = data.days[di];
  if (si === 0) return null;
  const prevStop = day.stops[si - 1];
  const drive = day.drives[si - 1] || 0;
  return timeToMinutes(prevStop.depart) + drive;
}

function onStayChange() {
  if (!editTarget) return;
  const stayVal = parseInt(document.getElementById('edit-stay').value);
  if (isNaN(stayVal) || stayVal < 0) return;
  const arrivalMins = getArrivalMins();
  if (arrivalMins === null) return;
  document.getElementById('edit-depart').value = minutesToTime(arrivalMins + stayVal);
  updateModalHint();
}

function onDepartChange() {
  if (!editTarget) return;
  const departVal = document.getElementById('edit-depart').value;
  if (!departVal) return;
  const arrivalMins = getArrivalMins();
  if (arrivalMins === null) return;
  const stayMins = Math.max(0, timeToMinutes(departVal) - arrivalMins);
  document.getElementById('edit-stay').value = stayMins;
  updateModalHint();
}

function updateModalHint() {
  const hint = document.getElementById('modal-arrival-hint');
  if (!editTarget) { hint.textContent = ''; return; }
  const { di, si } = editTarget;
  const day = data.days[di];
  const arrivalMins = getArrivalMins();
  const departVal = document.getElementById('edit-depart').value;
  if (!departVal) { hint.textContent = ''; return; }
  const leaveMins = timeToMinutes(departVal);
  const drive = day.drives[si] || 0;
  const isLast = si === day.stops.length - 1;
  const stayVal = parseInt(document.getElementById('edit-stay').value) || 0;

  let hint1 = arrivalMins !== null ? `抵達 ${minutesToTime(arrivalMins)}` : '';
  let hint2 = stayVal ? `停留 ${stayVal} 分鐘後 ${minutesToTime(leaveMins)} 離開` : `${minutesToTime(leaveMins)} 離開`;
  let hint3 = (!isLast && drive) ? `→ 下一站約 ${minutesToTime(leaveMins + drive)} 抵達` : '';

  hint.textContent = [hint1, hint2, hint3].filter(Boolean).join('　');
}

function saveStop() {
  const { di, si } = editTarget;
  const stop = data.days[di].stops[si];
  stop.name = document.getElementById('edit-name').value || stop.name;
  stop.note = document.getElementById('edit-note').value;
  stop.depart = document.getElementById('edit-depart').value || stop.depart;
  stop.stay = parseInt(document.getElementById('edit-stay').value) || 0;
  recalcTimes(di, si);
  closeModal();
  renderStops(di);
  showToast('✅ 已儲存，時間已重新計算');
}
function closeModal() {
  document.getElementById('stop-modal').classList.remove('open');
  editTarget = null;
}

// ═══════════════════════════════════════════
// EDIT DRIVE TIME
// ═══════════════════════════════════════════
let driveTarget = null;
function editDrive(di, si) {
  driveTarget = { di, si };
  document.getElementById('edit-drive').value = data.days[di].drives[si];
  document.getElementById('transit-modal').classList.add('open');
}
function saveDrive() {
  const { di, si } = driveTarget;
  const val = parseInt(document.getElementById('edit-drive').value);
  if (val > 0) {
    data.days[di].drives[si] = val;
    recalcTimes(di);
    renderStops(di);
    showToast('🚗 車程已更新，時間重新計算');
  }
  closeTransitModal();
}
function closeTransitModal() {
  document.getElementById('transit-modal').classList.remove('open');
  driveTarget = null;
}

// ═══════════════════════════════════════════
// ADD / DELETE STOP
// ═══════════════════════════════════════════
function addStop(di) {
  const day = data.days[di];
  const lastStop = day.stops[day.stops.length - 1];
  day.stops.push({ name: "🆕 新景點", depart: lastStop.depart, stay: 60, note: "" });
  day.drives.push(15);
  recalcTimes(di);
  renderStops(di);
  editStop(di, day.stops.length - 1);
}
function deleteStop(di, si) {
  const day = data.days[di];
  if (day.stops.length <= 2) { showToast('⚠️ 至少需要保留 2 個景點'); return; }
  day.stops.splice(si, 1);
  if (si < day.drives.length) day.drives.splice(si, 1);
  recalcTimes(di);
  renderStops(di);
  showToast('🗑 已刪除景點');
}

function moveStop(di, si, dir) {
  const day = data.days[di];
  const targetIdx = si + dir;
  if (targetIdx < 0 || targetIdx >= day.stops.length) return;

  [day.stops[si], day.stops[targetIdx]] = [day.stops[targetIdx], day.stops[si]];

  const driveIdx = dir === 1 ? si : si - 1;
  if (driveIdx >= 0 && driveIdx + 1 < day.drives.length) {
    [day.drives[driveIdx], day.drives[driveIdx + 1]] = [day.drives[driveIdx + 1], day.drives[driveIdx]];
  }

  recalcTimes(di);
  renderStops(di);
  showToast('↕️ 景點已移動，時間已重新計算');
}

// ═══════════════════════════════════════════
// ADD / DELETE DAY
// ═══════════════════════════════════════════
function addDay() {
  const dayNum = data.days.length + 1;
  const newDay = {
    label: `Day ${dayNum}`,
    theme: "新的一天",
    stops: [
      { name: "🏨 住宿出發", depart: "09:00", stay: 0, note: "" },
      { name: "📍 目的地", depart: "10:00", stay: 60, note: "" }
    ],
    drives: [30]
  };
  data.days.push(newDay);
  renderItinerary();
  showToast(`✅ 已新增 Day ${dayNum}，請點擊標題編輯資訊`);
  setTimeout(() => {
    const cards = document.querySelectorAll('.day-card');
    if (cards.length) cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function deleteDay(di) {
  if (data.days.length <= 1) { showToast('⚠️ 至少需要保留 1 天'); return; }
  const dayLabel = data.days[di].label;
  if (!confirm(`確定要刪除「${dayLabel}」嗎？`)) return;
  data.days.splice(di, 1);
  renderItinerary();
  showToast(`🗑 已刪除 ${dayLabel}`);
}

// ═══════════════════════════════════════════
// EDIT DAY INFO
// ═══════════════════════════════════════════
let editDayTarget = null;
function editDay(di) {
  editDayTarget = di;
  document.getElementById('edit-day-label').value = data.days[di].label;
  document.getElementById('edit-day-theme').value = data.days[di].theme;
  document.getElementById('day-modal').classList.add('open');
}
function saveDayInfo() {
  const di = editDayTarget;
  data.days[di].label = document.getElementById('edit-day-label').value || data.days[di].label;
  data.days[di].theme = document.getElementById('edit-day-theme').value || data.days[di].theme;
  closeDayModal();
  renderItinerary();
  showToast('✅ 天數資訊已更新');
}
function closeDayModal() {
  document.getElementById('day-modal').classList.remove('open');
  editDayTarget = null;
}

// ═══════════════════════════════════════════
// EDIT TRIP TITLE & SUBTITLE
// ═══════════════════════════════════════════
function editTripTitle() {
  document.getElementById('edit-trip-title').value = data.title;
  document.getElementById('title-modal').classList.add('open');
}
function saveTripTitle() {
  data.title = document.getElementById('edit-trip-title').value || data.title;
  closeTitleModal();
  renderAll();
  showToast('✅ 旅遊名稱已更新');
}
function closeTitleModal() {
  document.getElementById('title-modal').classList.remove('open');
}

function editSubtitle() {
  document.getElementById('edit-subtitle').value = data.subtitle;
  document.getElementById('subtitle-modal').classList.add('open');
}
function saveSubtitle() {
  data.subtitle = document.getElementById('edit-subtitle').value || data.subtitle;
  closeSubtitleModal();
  renderAll();
  showToast('✅ 副標題已更新');
}
function closeSubtitleModal() {
  document.getElementById('subtitle-modal').classList.remove('open');
}

// ═══════════════════════════════════════════
// EXPORT MENU
// ═══════════════════════════════════════════
function toggleExportMenu() {
  document.getElementById('export-menu').classList.toggle('open');
}
document.addEventListener('click', function(e) {
  const wrap = document.querySelector('.export-wrap');
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById('export-menu').classList.remove('open');
  }
});

// ═══════════════════════════════════════════
// JSON 匯出
// ═══════════════════════════════════════════
function exportJSON() {
  document.getElementById('export-menu').classList.remove('open');
  // 匯出時清除 mapPlaces（已廢棄），確保乾淨
  const exportObj = JSON.parse(JSON.stringify(data));
  delete exportObj.mapPlaces;
  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const safeName = data.title.replace(/[\u{1F300}-\u{1FFFF}\s]/gu, '').replace(/[^\w\u4e00-\u9fff]/g, '') || '旅遊行程';
  a.download = `${safeName}行程.json`;
  a.click();
  showToast('📋 JSON 已匯出！可分享給其他人匯入');
}

// ═══════════════════════════════════════════
// JSON 匯入
// ═══════════════════════════════════════════
function importJSON() {
  document.getElementById('export-menu').classList.remove('open');
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const parsed = JSON.parse(ev.target.result);
        // 驗證基本結構
        if (!parsed.title || !Array.isArray(parsed.days)) {
          showToast('⚠️ JSON 格式不正確，請確認是由本程式匯出的行程檔');
          return;
        }
        // 清除廢棄的 mapPlaces
        delete parsed.mapPlaces;
        // 寫入 localStorage 並更新
        data = parsed;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        renderAll();
        showToast(`✅ 已匯入「${data.title}」，共 ${data.days.length} 天行程！`);
      } catch(err) {
        showToast('⚠️ 讀取 JSON 失敗，請確認檔案格式正確');
        console.error('JSON 匯入失敗', err);
      }
    };
    reader.readAsText(file, 'utf-8');
  };
  input.click();
}


function exportHTML() {
  document.getElementById('export-menu').classList.remove('open');
  // 移除廢棄的 mapPlaces，保持 data 乾淨
  const exportObj = JSON.parse(JSON.stringify(data));
  delete exportObj.mapPlaces;
  const dataStr = JSON.stringify(exportObj);
  const currentHTML = document.documentElement.outerHTML;
  const exported = currentHTML.replace(
    /const DEFAULT_DATA = \{[\s\S]*?\};\s*\n/,
    `const DEFAULT_DATA = ${dataStr};\n`
  );
  const blob = new Blob([exported], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const safeName = data.title.replace(/[\u{1F300}-\u{1FFFF}\s]/gu, '').replace(/[^\w\u4e00-\u9fff]/g, '') || '旅遊行程';
  a.download = `${safeName}行程.html`;
  a.click();
  showToast('💾 HTML 已下載，已嵌入最新行程！');
}

// ═══════════════════════════════════════════
// IMAGE EXPORT
// ═══════════════════════════════════════════
function openImgExport() {
  document.getElementById('export-menu').classList.remove('open');
  const list = document.getElementById('img-day-list');
  list.innerHTML = '';
  data.days.forEach((day, di) => {
    const btn = document.createElement('button');
    btn.className = 'img-day-item';
    btn.innerHTML = `
      <div class="img-day-item-inner">
        <div class="iday-label">🗓 ${day.label}</div>
        <div class="iday-stops">${day.theme} · ${day.stops.length} 個景點</div>
      </div>
      <span style="font-size:1.2rem">⬇️</span>
    `;
    btn.onclick = () => exportDayImg(di);
    list.appendChild(btn);
  });
  document.getElementById('img-export-modal').classList.add('open');
}
function closeImgExport() {
  document.getElementById('img-export-modal').classList.remove('open');
}

function buildCaptureHTML(di) {
  const day = data.days[di];
  let stopsHTML = '';
  day.stops.forEach((stop, si) => {
    const isLast = si === day.stops.length - 1;
    const noteTag = stop.note ? `<span class="tag tag-note">${stop.note}</span>` : '';

    let arriveTag = '';
    if (si > 0) {
      const prevStop = day.stops[si - 1];
      const drive = day.drives[si - 1] || 0;
      const arrMins = timeToMinutes(prevStop.depart) + drive;
      arriveTag = `<span class="tag tag-arrive">抵達 ${minutesToTime(arrMins)}</span>`;
    }
    const leaveTag = !isLast
      ? `<span class="tag tag-leave">離開 ${stop.depart}</span>`
      : `<span class="tag tag-arrive">抵達 ${stop.depart}</span>`;
    stopsHTML += `
      <div class="capture-stop-row ${isLast ? 'cap-last' : ''}">
        <div class="cap-left">
          <div class="cap-num">${si + 1}</div>
          <div class="cap-line"></div>
        </div>
        <div class="cap-content">
          <div class="cap-name">${stop.name}</div>
          <div class="cap-tags">${arriveTag}${leaveTag}${noteTag}</div>
        </div>
      </div>
    `;
    if (!isLast) {
      stopsHTML += `
        <div class="cap-transit">
          <span class="cap-transit-text">🚗 約 ${day.drives[si]} 分鐘</span>
        </div>
      `;
    }
  });

  const card = document.createElement('div');
  card.className = 'capture-card';
  card.style.position = 'fixed';
  card.style.left = '-9999px';
  card.style.top = '0';
  card.style.width = '680px';
  card.innerHTML = `
    <div class="capture-header">
      <span class="ch-emoji">🏝</span>
      <div class="ch-title">${data.title.replace(/^[\p{Emoji}\s]+/u,'')}</div>
      <div class="ch-sub">${data.subtitle}</div>
      <div class="ch-day">🗓 ${day.label} · ${day.theme}</div>
    </div>
    <div class="capture-body">
      ${stopsHTML}
    </div>
    <div class="capture-footer">由互動行程產生 · ${data.title}</div>
  `;
  return card;
}

async function exportDayImg(di) {
  closeImgExport();
  showProgress(`正在產生 Day ${di + 1} 圖片…`, 30);

  await new Promise(r => setTimeout(r, 100));
  const card = buildCaptureHTML(di);
  document.body.appendChild(card);

  try {
    showProgress(`正在渲染…`, 60);
    await new Promise(r => setTimeout(r, 200));
    const canvas = await html2canvas(card, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 680,
      logging: false
    });
    showProgress(`正在下載…`, 90);
    const a = document.createElement('a');
    const dayNum = di + 1;
    const safeName = data.title.replace(/[\u{1F300}-\u{1FFFF}\s]/gu,'').replace(/[^\w\u4e00-\u9fff]/g,'') || '行程';
    a.download = `${safeName}_Day${dayNum}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    hideProgress();
    showToast(`🖼️ Day ${dayNum} 圖片已下載！`);
  } catch(e) {
    hideProgress();
    showToast('⚠️ 圖片產生失敗，請重試');
  } finally {
    document.body.removeChild(card);
  }
}

async function exportAllDaysImg() {
  closeImgExport();
  const total = data.days.length;
  for (let di = 0; di < total; di++) {
    showProgress(`正在產生 Day ${di + 1} / ${total} 圖片…`, Math.round((di / total) * 100));
    await new Promise(r => setTimeout(r, 150));
    const card = buildCaptureHTML(di);
    document.body.appendChild(card);
    try {
      await new Promise(r => setTimeout(r, 200));
      const canvas = await html2canvas(card, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 680,
        logging: false
      });
      const a = document.createElement('a');
      const safeName = data.title.replace(/[\u{1F300}-\u{1FFFF}\s]/gu,'').replace(/[^\w\u4e00-\u9fff]/g,'') || '行程';
      a.download = `${safeName}_Day${di + 1}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      await new Promise(r => setTimeout(r, 600));
    } catch(e) {
      console.error(e);
    } finally {
      document.body.removeChild(card);
    }
  }
  hideProgress();
  showToast(`✅ 全部 ${total} 天圖片已下載！`);
}

// ═══════════════════════════════════════════
// PDF EXPORT
// ═══════════════════════════════════════════
async function exportPDF() {
  document.getElementById('export-menu').classList.remove('open');
  showProgress('正在準備列印…', 30);
  await new Promise(r => setTimeout(r, 200));
  hideProgress();

  const printHTML = buildPrintHTML();
  const printWin = window.open('', '_blank', 'width=800,height=900');
  printWin.document.write(printHTML);
  printWin.document.close();
  printWin.onload = () => {
    setTimeout(() => {
      printWin.focus();
      printWin.print();
    }, 500);
  };
  showToast('📄 列印視窗已開啟，選擇「儲存為 PDF」');
}

function buildPrintHTML() {
  let daysHTML = '';
  data.days.forEach((day, di) => {
    let stopsHTML = '';
    day.stops.forEach((stop, si) => {
      const isLast = si === day.stops.length - 1;
      const noteTag = stop.note ? `<span class="tag tag-note">${stop.note}</span>` : '';
      let arriveTag = '';
      if (si > 0) {
        const prevStop = day.stops[si - 1];
        const drive = day.drives[si - 1] || 0;
        const arrMins = timeToMinutes(prevStop.depart) + drive;
        arriveTag = `<span class="tag tag-arrive">抵達 ${minutesToTime(arrMins)}</span>`;
      }
      const leaveTag = !isLast
        ? `<span class="tag tag-leave">離開 ${stop.depart}</span>`
        : `<span class="tag tag-arrive">抵達 ${stop.depart}</span>`;
      stopsHTML += `
        <div class="capture-stop-row ${isLast ? 'cap-last' : ''}">
          <div class="cap-left">
            <div class="cap-num">${si + 1}</div>
            <div class="cap-line"></div>
          </div>
          <div class="cap-content">
            <div class="cap-name">${stop.name}</div>
            <div class="cap-tags">${arriveTag}${leaveTag}${noteTag}</div>
          </div>
        </div>
        ${!isLast ? `<div class="cap-transit"><span class="cap-transit-text">🚗 約 ${day.drives[si]} 分鐘</span></div>` : ''}
      `;
    });
    daysHTML += `
      <div class="print-day-card">
        <div class="capture-header" style="border-radius:12px 12px 0 0">
          <div class="ch-day" style="margin:0;font-size:1rem">🗓 ${day.label} · ${day.theme}</div>
        </div>
        <div class="capture-body">${stopsHTML}</div>
      </div>
    `;
  });

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<title>${data.title} · 行程</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root {
  --ocean: #1a6b8a; --sky: #5aa8c8; --sky-light: #a8d4e8; --sand: #f5ede0;
  --coral: #e07a5f; --dark: #1c2b35; --mid: #4a6274; --light: #eaf4f8;
  --white: #fff; --border: #cce0ea; --green: #2d9e6b; --green-bg: #d8f0e4;
  --amber: #8a6200; --amber-bg: #fef3cd; --amber-light: #b07c20; --amber-light-bg: #fff8e6;
  --red: #9b3020; --red-bg: #fce4e0;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Noto Sans TC', sans-serif; color: var(--dark); background: white; }
.print-header { background: linear-gradient(135deg, var(--ocean), var(--sky)); color: white; padding: 32px; text-align: center; margin-bottom: 24px; }
.print-header h1 { font-family: 'Noto Serif TC', serif; font-size: 1.8rem; letter-spacing: 0.1em; }
.print-header p { font-size: 0.9rem; opacity: 0.85; margin-top: 6px; }
.print-day-card { margin: 0 16px 20px; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; page-break-inside: avoid; }
.capture-header { background: linear-gradient(90deg, var(--ocean), var(--sky)); color: white; padding: 14px 20px; }
.ch-day { font-family: 'Noto Serif TC', serif; font-size: 0.95rem; font-weight: 600; }
.capture-body { padding: 12px 20px 16px; background: white; }
.capture-stop-row { display: flex; align-items: stretch; }
.cap-left { display: flex; flex-direction: column; align-items: center; width: 30px; flex-shrink: 0; margin-right: 12px; }
.cap-num { width: 24px; height: 24px; border-radius: 50%; background: var(--ocean); color: white; font-size: 0.68rem; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 12px; }
.cap-line { width: 2px; background: var(--border); flex: 1; margin-top: 4px; }
.cap-last .cap-line { display: none; }
.cap-content { flex: 1; padding: 10px 0 8px; border-bottom: 1px solid #f5f5f5; }
.cap-last .cap-content { border-bottom: none; }
.cap-name { font-family: 'Noto Serif TC', serif; font-size: 0.9rem; font-weight: 600; }
.cap-tags { display: flex; gap: 5px; margin-top: 4px; flex-wrap: wrap; }
.tag { font-size: 0.68rem; padding: 2px 7px; border-radius: 8px; }
.tag-arrive { background: var(--amber-bg); color: var(--amber); }
.tag-leave  { background: #fff8e6; color: #b07c20; }
.tag-note { background: var(--red-bg); color: var(--red); }
.cap-transit { padding: 3px 0 3px 42px; }
.cap-transit-text { font-size: 0.7rem; color: var(--sky); background: var(--light); padding: 2px 7px; border-radius: 6px; }
.print-footer { text-align: center; font-size: 0.72rem; color: var(--mid); padding: 16px; margin-top: 8px; }
@media print {
  body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .print-day-card { page-break-inside: avoid; margin: 0 0 16px; }
  @page { margin: 15mm; size: A4; }
}
</style>
</head>
<body>
<div class="print-header">
  <h1>${data.title}</h1>
  <p>${data.subtitle}</p>
</div>
${daysHTML}
<div class="print-footer">由互動行程產生 · 請在列印對話框選擇「另存為 PDF」</div>
</body></html>`;
}

// ═══════════════════════════════════════════
// PROGRESS
// ═══════════════════════════════════════════
function showProgress(msg, pct) {
  document.getElementById('progress-text').textContent = msg;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-overlay').classList.add('open');
}
function hideProgress() {
  document.getElementById('progress-overlay').classList.remove('open');
}

// ═══════════════════════════════════════════
// PAGE NAV
// ═══════════════════════════════════════════
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`page-${name}`).classList.add('active');
  const btns = document.querySelectorAll('.nav-btn');
  if (name === 'itinerary') {
    btns[0].classList.add('active');
  } else if (name === 'map') {
    // 切換到地圖時，永遠依最新 data 重新渲染
    renderMap();
  }
}

// ═══════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ═══════════════════════════════════════════
// MODAL CLOSE ON OVERLAY CLICK
// ═══════════════════════════════════════════
['stop-modal','transit-modal','title-modal','subtitle-modal','day-modal','img-export-modal'].forEach(id => {
  document.getElementById(id).addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });
});

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
renderAll();
