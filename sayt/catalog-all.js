// Barcha tovarlar katalogi: Gornitsa'dan boshqa 764 ta tovarni bo'limlar bo'yicha chiqaradi.
// Gornitsa tovarlari saytning o'z vitrinasida (#catalog) turadi.
// Ma'lumot va rasmlar GitHub sahifasidan olinadi, shuning uchun bu yerga yuklash shart emas.
(function () {
  const MANBA = 'https://xojiakbarergashgev-cmyk.github.io/gornitsa/';
  const KURS = 12840; // 1 $ taxminan necha so'm (saytdagi boshqa narxlar bilan bir xil)
  const QADAM = 24;   // bir martada chiqadigan kartochkalar soni

  const BOLIMLAR = [
    { k: 'sirli', n: 'Sirli idishlar', s: 109, t: 'Sirli (emal) idish' },
    { k: 'kitay', n: 'Xitoy naborlari', s: 170, t: 'Xitoy nabori' },
    { k: 'bitplast', n: 'Bitplast', s: 322, t: 'Bitplast' },
    { k: 'soat', n: 'Soatlar', s: 135, t: 'Devor soati' },
    { k: 'boshqa', n: 'Boshqa tovarlar', s: 28, t: 'Boshqa' },
  ];

  const tabs = document.getElementById('all-tabs');
  const grid = document.getElementById('all-grid');
  const more = document.getElementById('all-more');
  const qidiruv = document.getElementById('all-search');
  const soni = document.getElementById('all-count');
  if (!tabs || !grid) return;

  const kesh = {};
  let joriy = 'sirli';
  let royxat = [];
  let korsatildi = 0;

  const xavfsiz = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const somda = (usd) => Math.round(usd * KURS / 1000) * 1000;
  const somMatn = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";

  // Bo'lim tugmalari
  BOLIMLAR.forEach((b, i) => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'tab-btn' + (i === 0 ? ' active' : '');
    t.dataset.bolim = b.k;
    t.textContent = `${b.n} (${b.s})`;
    t.addEventListener('click', () => bolimgaOt(b.k));
    tabs.appendChild(t);
  });

  function kartochka(t, bolim) {
    const narxBor = !!t.pr;
    const usd = narxBor ? parseFloat(t.pr) : 0;
    const uzs = narxBor ? somda(usd) : 0;
    const rasm = t.im ? `${MANBA}img3d/${t.id}.webp` : 'images/logo_official.png';
    const savatRasm = t.im ? `${MANBA}img/${t.id}.jpg` : 'images/logo_official.png';
    const qisqa = [t.ar ? `Artikul: ${xavfsiz(t.ar)}` : '', t.pk ? `Qutida: ${t.pk} dona` : '', t.og ? `Ishlab chiqarilgan: ${t.og}` : '']
      .filter(Boolean).join(' · ');
    const nom = `№ ${t.no}. ${t.nm}`;
    const d = document.createElement('div');
    d.className = 'master-product-card all-card';
    d.innerHTML = `
      <div class="master-image-box">
        <span class="all-num">№ ${t.no}</span>
        <img src="${rasm}" alt="${xavfsiz(t.nm)}" class="p3d-img" loading="lazy" decoding="async">
        ${t.n > 1 ? `<span class="all-photos">${t.n} ta rasm</span>` : ''}
      </div>
      <div class="product-details">
        <span class="product-category">${xavfsiz(bolim.t)}</span>
        <h3 class="product-title">${xavfsiz(t.nm)}</h3>
        <p class="product-brief">${qisqa}</p>
        <div class="price-box-highlight">
          <span class="optom-tag">OPTOM NARXI</span>
          <div class="active-price-usd">${narxBor ? t.pr.replace('.', ',') + ' $' : "Narxini so'rang"}</div>
          ${narxBor ? `<div class="active-price-uzs">~ ${somMatn(uzs)}</div>` : ''}
        </div>
        <div class="all-actions">
          <a class="btn all-btn-ghost" href="https://t.me/EMALGORNITSAPLAST/${t.id}" target="_blank" rel="noopener">Rasmlari</a>
          ${narxBor
            ? `<button type="button" class="btn btn-primary add-to-cart-direct" data-id="all-${bolim.k}-${t.no}" data-name="${xavfsiz(nom)}" data-usd="${usd}" data-uzs="${uzs}" data-img="${savatRasm}">Savatga qo'shish</button>`
            : `<a class="btn btn-primary" href="https://t.me/+998977035131" target="_blank" rel="noopener">Narxini so'rash</a>`}
        </div>
      </div>`;
    return d;
  }

  function yanaKorsat() {
    const bolim = BOLIMLAR.find((b) => b.k === joriy);
    const f = document.createDocumentFragment();
    royxat.slice(korsatildi, korsatildi + QADAM).forEach((t) => f.appendChild(kartochka(t, bolim)));
    korsatildi += QADAM;
    grid.appendChild(f);
    more.innerHTML = korsatildi < royxat.length
      ? `<button type="button" class="btn btn-primary btn-lg" id="all-more-btn">Yana ko'rsatish (${royxat.length - korsatildi} ta qoldi)</button>`
      : '';
    const b = document.getElementById('all-more-btn');
    if (b) b.addEventListener('click', yanaKorsat);
  }

  function filtrla() {
    const q = (qidiruv.value || '').trim().toLowerCase();
    royxat = (kesh[joriy] || []).filter((t) => !q || `${t.no} ${t.nm} ${t.ar} ${t.ds}`.toLowerCase().includes(q));
    korsatildi = 0;
    grid.innerHTML = '';
    soni.textContent = `${royxat.length} ta tovar`;
    if (!royxat.length) {
      grid.innerHTML = '<p class="all-empty">Hech narsa topilmadi. Boshqa so\'z bilan qidirib ko\'ring.</p>';
      more.innerHTML = '';
      return;
    }
    yanaKorsat();
  }

  async function bolimgaOt(k) {
    joriy = k;
    tabs.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.bolim === k));
    if (!kesh[k]) {
      grid.innerHTML = '<p class="all-empty">Tovarlar yuklanmoqda…</p>';
      more.innerHTML = '';
      try {
        kesh[k] = await fetch(`${MANBA}data/${k}.json`).then((r) => r.json());
      } catch (e) {
        grid.innerHTML = '<p class="all-empty">Tovarlar yuklanmadi. Internetni tekshirib, sahifani yangilang.</p>';
        return;
      }
      if (joriy !== k) return;
    }
    filtrla();
  }

  let kut;
  qidiruv.addEventListener('input', () => { clearTimeout(kut); kut = setTimeout(filtrla, 200); });
  bolimgaOt('sirli');
})();
