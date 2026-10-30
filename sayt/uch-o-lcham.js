// 3D effekt: tovar sichqoncha yoki barmoq bilan surilganda chapga-o'ngga buriladi.
// Har bir .p3d ichidagi rasm .p3d-obj o'ramiga olinadi, burilish o'ramga beriladi
// (rasmning o'zidagi hajm animatsiyasi buzilmasligi uchun).
(function () {
  const kamHarakat = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tayyorla(quti) {
    if (quti.dataset.p3dTayyor) return;
    const img = quti.querySelector('img.master-img, img.p3d-img');
    if (!img) return;
    quti.dataset.p3dTayyor = '1';
    quti.classList.add('p3d');

    const orov = document.createElement('div');
    orov.className = 'p3d-obj' + (kamHarakat ? '' : ' p3d-tebranish');
    img.parentNode.insertBefore(orov, img);
    orov.appendChild(img);

    const soya = document.createElement('div');
    soya.className = 'p3d-soya';
    quti.appendChild(soya);

    const belgi = document.createElement('span');
    belgi.className = 'p3d-belgi';
    belgi.textContent = '3D';
    quti.appendChild(belgi);

    let ushlangan = false;
    let boshX = 0;
    let burchak = 0;

    const qoy = (ry, rx) => {
      orov.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg)`;
      soya.style.transform = `translateX(${-ry * 0.6}px) scaleX(${1 - Math.abs(ry) / 160})`;
    };

    quti.addEventListener('pointerenter', () => orov.classList.remove('p3d-tebranish'));
    quti.addEventListener('pointermove', (e) => {
      const r = quti.getBoundingClientRect();
      if (ushlangan) {
        burchak = Math.max(-55, Math.min(55, burchak + (e.clientX - boshX) * 0.6));
        boshX = e.clientX;
        qoy(burchak, 0);
        return;
      }
      if (e.pointerType === 'mouse') {
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        qoy(x * 50, -y * 14);
      }
    });
    quti.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, a')) return;
      ushlangan = true;
      boshX = e.clientX;
      orov.classList.remove('p3d-tebranish');
      try { quti.setPointerCapture(e.pointerId); } catch (_) {}
    });
    const qoyibYubor = () => {
      ushlangan = false;
      burchak = 0;
      orov.style.transform = '';
      soya.style.transform = '';
      if (!kamHarakat) orov.classList.add('p3d-tebranish');
    };
    quti.addEventListener('pointerup', qoyibYubor);
    quti.addEventListener('pointercancel', qoyibYubor);
    quti.addEventListener('pointerleave', () => { if (!ushlangan) qoyibYubor(); });
  }

  function hammasi() {
    document.querySelectorAll('#products-grid .master-image-box, .all-card .master-image-box, .hero-3d').forEach(tayyorla);
  }

  hammasi();
  // Katalogda keyin qo'shiladigan kartochkalar uchun
  new MutationObserver(hammasi).observe(document.body, { childList: true, subtree: true });
})();
