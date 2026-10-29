// Gornitsa katalog boti — Cloudflare Worker uchun
// Telegram yangiliklarini qabul qiladi (webhook) va javob qaytaradi.
// Sozlamalar: BOT_TOKEN — maxfiy o'zgaruvchi sifatida Cloudflare'da kiritiladi.

const SAYT = "https://xojiakbarergashgev-cmyk.github.io/gornitsa/";
const BUYURTMA_HAVOLA = "https://t.me/+998977035131";
const TELEFON = "+998 97 703 51 31";
const MANZIL = "Eski Chinni bozor, 3-qator, 44-do'kon";
const KANAL = "https://t.me/EMALGORNITSAPLAST";
const SAHIFA = 8; // bitta sahifadagi tovarlar soni

const BOLIMLAR = [
  { k: "gornitsa", n: "🔥 Gornitsa" },
  { k: "sirli", n: "🫖 Sirli idishlar" },
  { k: "kitay", n: "🎁 Xitoy naborlari" },
  { k: "bitplast", n: "🧺 Bitplast" },
  { k: "soat", n: "🕰 Soatlar" },
  { k: "boshqa", n: "📦 Boshqa tovarlar" },
];

// ---------- Ma'lumotlarni yuklash (qisqa muddat xotirada saqlanadi) ----------
const xotira = {};
async function bolimMalumoti(k) {
  const v = xotira[k];
  if (v && Date.now() - v.t < 10 * 60 * 1000) return v.d;
  const r = await fetch(SAYT + "data/" + k + ".json", { cf: { cacheTtl: 600 } });
  const d = await r.json();
  xotira[k] = { t: Date.now(), d };
  return d;
}
const bolimNomi = (k) => (BOLIMLAR.find((b) => b.k === k) || {}).n || k;
const rasm = (t) => SAYT + "img/" + t.id + ".jpg";
const narx = (t) => (t.pr ? t.pr.replace(".", ",") + " $" : "narxini so'rang");
const html = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

// ---------- Telegram API ----------
async function tg(env, usul, malumot) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${usul}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(malumot),
  });
  return r.json();
}

// ---------- Klaviaturalar ----------
function bosh_klaviatura() {
  const q = [];
  for (let i = 0; i < BOLIMLAR.length; i += 2)
    q.push(BOLIMLAR.slice(i, i + 2).map((b) => ({ text: b.n, callback_data: `s:${b.k}:0` })));
  q.push([{ text: "📚 Katalogni to'liq ochish", web_app: { url: SAYT } }]);
  q.push([{ text: "📝 Buyurtma berish", url: BUYURTMA_HAVOLA }, { text: "📞 Aloqa", callback_data: "aloqa" }]);
  return { inline_keyboard: q };
}

async function bolimSahifasi(k, sahifa) {
  const d = await bolimMalumoti(k);
  const jami = Math.ceil(d.length / SAHIFA) || 1;
  sahifa = Math.max(0, Math.min(sahifa, jami - 1));
  const qism = d.slice(sahifa * SAHIFA, (sahifa + 1) * SAHIFA);
  const matn =
    `<b>${bolimNomi(k)}</b> — ${d.length} ta tovar\n` +
    `Sahifa ${sahifa + 1} / ${jami}\n\n` +
    qism.map((t) => `<b>${t.no}.</b> ${html(t.nm)} — <b>${narx(t)}</b>`).join("\n") +
    `\n\nKo'rish uchun tovar raqamini bosing.`;
  const q = [];
  for (let i = 0; i < qism.length; i += 4)
    q.push(qism.slice(i, i + 4).map((t) => ({ text: `№ ${t.no}`, callback_data: `i:${k}:${t.no}` })));
  const nav = [];
  if (sahifa > 0) nav.push({ text: "◀️ Oldingi", callback_data: `s:${k}:${sahifa - 1}` });
  if (sahifa < jami - 1) nav.push({ text: "Keyingi ▶️", callback_data: `s:${k}:${sahifa + 1}` });
  if (nav.length) q.push(nav);
  q.push([{ text: "🏠 Bosh menyu", callback_data: "menyu" }]);
  return { matn, klaviatura: { inline_keyboard: q } };
}

async function tovarKartochkasi(k, no) {
  const d = await bolimMalumoti(k);
  const t = d.find((x) => x.no === no);
  if (!t) return null;
  const qatorlar = [
    `<b>№ ${t.no}. ${html(t.nm)}</b>`,
    `${bolimNomi(k)}`,
    ``,
    `💵 Ulgurji narx: <b>${narx(t)}</b>`,
  ];
  if (t.ar) qatorlar.push(`🔖 Artikul: ${html(t.ar)}`);
  if (t.pk) qatorlar.push(`📦 Qutida: ${t.pk} dona`);
  if (t.og) qatorlar.push(`🌍 Ishlab chiqarilgan: ${t.og}`);
  qatorlar.push(``, `📝 Buyurtma: ${TELEFON}`);
  const sahifa = Math.floor((t.no - 1) / SAHIFA);
  const q = [
    [{ text: "📝 Buyurtma berish", url: BUYURTMA_HAVOLA }],
    [{ text: `🖼 Barcha rasmlari (${t.n || 1} ta)`, url: `${KANAL}/${t.id}` }],
    [
      ...(t.no > 1 ? [{ text: "◀️", callback_data: `i:${k}:${t.no - 1}` }] : []),
      { text: "📋 Ro'yxatga", callback_data: `s:${k}:${sahifa}` },
      ...(t.no < d.length ? [{ text: "▶️", callback_data: `i:${k}:${t.no + 1}` }] : []),
    ],
  ];
  return { t, caption: qatorlar.join("\n"), klaviatura: { inline_keyboard: q } };
}

// ---------- Qidiruv ----------
async function qidir(soz) {
  const s = soz.toLowerCase().trim();
  const natija = [];
  for (const b of BOLIMLAR) {
    const d = await bolimMalumoti(b.k);
    for (const t of d) {
      const matn = (t.nm + " " + t.ar + " " + t.ds).toLowerCase();
      if (matn.includes(s)) natija.push({ k: b.k, t });
      if (natija.length >= 16) return natija;
    }
  }
  return natija;
}

// ---------- Avtomatik javoblar ----------
const SALOM = "Assalomu alaykum! 👋\n\n<b>Emal · Gornitsa · Plast</b> ulgurji idish-tovoq katalogiga xush kelibsiz.\n\nBo'limni tanlang yoki tovar nomini yozing (masalan: <i>choynak</i>, <i>qozon</i>, <i>soat</i>).";
const ALOQA = `📞 <b>Aloqa</b>\n\nTelefon: ${TELEFON}\nTelegram: ${BUYURTMA_HAVOLA}\n📍 Manzil: ${MANZIL}\n📢 Kanal: ${KANAL}`;
const QOIDALAR = [
  { r: /(salom|assalom|привет|здравст|hello|hi\b)/i, javob: SALOM, menyu: true },
  { r: /(manzil|qayer|адрес|где|joylash)/i, javob: `📍 Manzilimiz: <b>${MANZIL}</b>\n\nQo'ng'iroq: ${TELEFON}` },
  { r: /(telefon|raqam|nomer|номер|aloqa|bog'lan|boglan|контакт)/i, javob: ALOQA },
  { r: /(yetkaz|dostav|доставк|olib kel)/i, javob: `🚚 Yetkazib berish bo'yicha kelishamiz.\nBuyurtma va yetkazib berish uchun: ${TELEFON}` },
  { r: /(narx|qancha|цена|сколько|price|прайс)/i, javob: "💵 Barcha narxlar ulgurji va katalogda ko'rsatilgan. Bo'limni tanlang yoki tovar nomini yozing.", menyu: true },
  { r: /(buyurtma|zakaz|заказ|olaman|sotib)/i, javob: `📝 Buyurtma berish uchun tovar raqami va sonini yozib yuboring:\n${BUYURTMA_HAVOLA}\nyoki qo'ng'iroq qiling: ${TELEFON}` },
  { r: /(ish vaqt|soat nech|qachon ochiq|режим|время работы)/i, javob: `🕘 Ish vaqtimiz bo'yicha qo'ng'iroq qilib aniqlashtiring: ${TELEFON}` },
  { r: /(rahmat|спасибо|thanks|raxmat)/i, javob: "Arzimaydi! 😊 Yana savollar bo'lsa, yozavering." },
];

// ---------- Asosiy ishlov ----------
async function xabar(env, m) {
  const chat = m.chat.id;
  const matn = (m.text || "").trim();
  if (!matn || matn === "/start" || matn === "/menu" || matn.startsWith("/start ")) {
    return tg(env, "sendPhoto", {
      chat_id: chat,
      photo: SAYT + "katalog_v2.jpg",
      caption: SALOM,
      parse_mode: "HTML",
      reply_markup: bosh_klaviatura(),
    });
  }
  if (matn === "/aloqa") return tg(env, "sendMessage", { chat_id: chat, text: ALOQA, parse_mode: "HTML" });

  for (const q of QOIDALAR) {
    if (q.r.test(matn)) {
      return tg(env, "sendMessage", {
        chat_id: chat,
        text: q.javob,
        parse_mode: "HTML",
        reply_markup: q.menyu ? bosh_klaviatura() : undefined,
      });
    }
  }

  if (matn.length >= 2) {
    const n = await qidir(matn);
    if (n.length) {
      const q = n.map(({ k, t }) => [{ text: `${bolimNomi(k).split(" ")[0]} № ${t.no} · ${t.nm.slice(0, 34)} — ${narx(t)}`, callback_data: `i:${k}:${t.no}` }]);
      q.push([{ text: "🏠 Bosh menyu", callback_data: "menyu" }]);
      return tg(env, "sendMessage", {
        chat_id: chat,
        text: `🔎 «${html(matn)}» bo'yicha ${n.length}${n.length >= 16 ? "+" : ""} ta tovar topildi:`,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: q },
      });
    }
  }
  return tg(env, "sendMessage", {
    chat_id: chat,
    text: `Kechirasiz, bu savolga javob topolmadim. 🙏\n\nKatalogdan bo'limni tanlang yoki to'g'ridan-to'g'ri yozing: ${BUYURTMA_HAVOLA}\nTelefon: ${TELEFON}`,
    reply_markup: bosh_klaviatura(),
  });
}

async function tugma(env, c) {
  const chat = c.message.chat.id;
  const mid = c.message.message_id;
  const ishPhoto = !!c.message.photo;
  const [tur, k, x] = c.data.split(":");
  await tg(env, "answerCallbackQuery", { callback_query_id: c.id });

  const matnGaAlmashtir = async (text, reply_markup) => {
    if (ishPhoto) {
      await tg(env, "deleteMessage", { chat_id: chat, message_id: mid });
      return tg(env, "sendMessage", { chat_id: chat, text, parse_mode: "HTML", reply_markup, disable_web_page_preview: true });
    }
    return tg(env, "editMessageText", { chat_id: chat, message_id: mid, text, parse_mode: "HTML", reply_markup, disable_web_page_preview: true });
  };

  if (tur === "menyu") {
    if (ishPhoto) return tg(env, "editMessageCaption", { chat_id: chat, message_id: mid, caption: SALOM, parse_mode: "HTML", reply_markup: bosh_klaviatura() });
    await tg(env, "deleteMessage", { chat_id: chat, message_id: mid });
    return tg(env, "sendPhoto", { chat_id: chat, photo: SAYT + "katalog_v2.jpg", caption: SALOM, parse_mode: "HTML", reply_markup: bosh_klaviatura() });
  }
  if (tur === "aloqa") return tg(env, "sendMessage", { chat_id: chat, text: ALOQA, parse_mode: "HTML" });
  if (tur === "s") {
    const s = await bolimSahifasi(k, parseInt(x, 10) || 0);
    return matnGaAlmashtir(s.matn, s.klaviatura);
  }
  if (tur === "i") {
    const kr = await tovarKartochkasi(k, parseInt(x, 10));
    if (!kr) return;
    const media = { type: "photo", media: kr.t.im ? rasm(kr.t) : SAYT + "katalog_v2.jpg", caption: kr.caption, parse_mode: "HTML" };
    if (ishPhoto) return tg(env, "editMessageMedia", { chat_id: chat, message_id: mid, media, reply_markup: kr.klaviatura });
    await tg(env, "deleteMessage", { chat_id: chat, message_id: mid });
    return tg(env, "sendPhoto", { chat_id: chat, photo: media.media, caption: kr.caption, parse_mode: "HTML", reply_markup: kr.klaviatura });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Bir martalik sozlash: brauzerda /sozla manzilini ochish webhook'ni o'rnatadi
    if (request.method === "GET" && url.pathname === "/sozla") {
      const hook = await tg(env, "setWebhook", { url: url.origin + "/", allowed_updates: ["message", "callback_query"] });
      await tg(env, "setMyCommands", {
        commands: [
          { command: "start", description: "Katalog va bosh menyu" },
          { command: "aloqa", description: "Telefon va manzil" },
        ],
      });
      return new Response(hook.ok ? "Tayyor! Bot ishga tushdi. Endi Telegram'da botga /start yozing." : "Xato: " + JSON.stringify(hook), {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    if (request.method !== "POST") return new Response("Gornitsa katalog boti ishlayapti.", { headers: { "content-type": "text/plain; charset=utf-8" } });
    try {
      const u = await request.json();
      if (u.message) await xabar(env, u.message);
      else if (u.callback_query) await tugma(env, u.callback_query);
    } catch (e) {
      console.log("xato", e && e.stack);
    }
    return new Response("ok");
  },
};
