// ========================================
// AUTH SİSTEMİ — localStorage
// ========================================

// Kullanıcıları localStorage'dan getir
function getUsers() {
  return JSON.parse(localStorage.getItem('medisync_users') || '[]');
}

// Kullanıcıları kaydet
function saveUsers(users) {
  localStorage.setItem('medisync_users', JSON.stringify(users));
}

// Aktif oturumu getir
function getSession() {
  return JSON.parse(localStorage.getItem('medisync_session') || 'null');
}

// Oturumu kaydet
function saveSession(user) {
  localStorage.setItem('medisync_session', JSON.stringify(user));
}

// Oturumu sil (çıkış yap)
function clearSession() {
  localStorage.removeItem('medisync_session');
}

// Kayıt ol
function register(ad, email, sifre) {
  var users = getUsers();
  // E-posta zaten kayıtlı mı?
  if (users.find(function(u) { return u.email === email; })) {
    return { basarili: false, mesaj: 'Bu e-posta adresi zaten kayıtlı.' };
  }
  var yeniKullanici = { id: Date.now(), ad: ad, email: email, sifre: sifre, kayitTarihi: new Date().toLocaleDateString('tr-TR') };
  users.push(yeniKullanici);
  saveUsers(users);
  saveSession(yeniKullanici);
  return { basarili: true, kullanici: yeniKullanici };
}

// Giriş yap
function login(email, sifre) {
  var users = getUsers();
  var kullanici = users.find(function(u) { return u.email === email && u.sifre === sifre; });
  if (!kullanici) {
    return { basarili: false, mesaj: 'E-posta veya şifre hatalı.' };
  }
  saveSession(kullanici);
  return { basarili: true, kullanici: kullanici };
}

// ========================================
// NAVBAR GÜNCELLE
// ========================================
function navbarGuncelle() {
  var session = getSession();
  var navBtns = document.querySelector('.nav-btns');
  if (!navBtns) return;

  if (session) {
    // Giriş yapılmış → kullanıcı adı + çıkış butonu göster
    navBtns.innerHTML =
      '<span style="font-size:14px;color:#555;margin-right:8px;">Merhaba, <strong>' + session.ad.split(' ')[0] + '</strong> 👋</span>' +
      '<button class="btn-ghost" onclick="cikisYap()">Çıkış Yap</button>';
  } else {
    // Giriş yapılmamış → normal butonlar
    navBtns.innerHTML =
      '<button class="btn-ghost" onclick="openModal(\'giris\')">Giriş Yap</button>' +
      '<button class="btn-primary" onclick="openModal(\'kayit\')">Ücretsiz Başla</button>';
  }
}

// Çıkış yap
window.cikisYap = function() {
  clearSession();
  navbarGuncelle();
  showToast('Başarıyla çıkış yapıldı. Görüşürüz! 👋', 'bilgi');
};

// ========================================
// TOAST BİLDİRİM
// ========================================
function showToast(mesaj, tip) {
  var renk = tip === 'basari' ? '#22c55e' : tip === 'hata' ? '#ef4444' : '#5c3db0';
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;background:' + renk + ';color:#fff;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:500;max-width:320px;box-shadow:0 8px 24px rgba(0,0,0,0.15);transition:opacity 0.4s;';
  toast.textContent = mesaj;
  document.body.appendChild(toast);
  setTimeout(function() { toast.style.opacity = '0'; }, 2800);
  setTimeout(function() { toast.remove(); }, 3200);
}

// ========================================
// MODAL
// ========================================
window.openModal = function(panel) {
  var overlay = document.getElementById('modalOverlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  switchPanel(panel);
  document.body.style.overflow = 'hidden';
  // Form hatalarını temizle
  document.querySelectorAll('.form-error').forEach(function(el) { el.textContent = ''; });
};

window.closeModal = function() {
  var overlay = document.getElementById('modalOverlay');
  if (!overlay) return;
  overlay.style.display = 'none';
  document.body.style.overflow = '';
};

window.switchPanel = function(panel) {
  var g = document.getElementById('panelGiris');
  var k = document.getElementById('panelKayit');
  if (g) g.style.display = panel === 'giris' ? 'block' : 'none';
  if (k) k.style.display = panel === 'kayit' ? 'block' : 'none';
};

// ========================================
// SAYFA YÜKLENINCE
// ========================================
document.addEventListener('DOMContentLoaded', function () {

  // Navbar güncelle
  navbarGuncelle();

  // Giriş yapılmışsa modal butonlarını güncelle
  var session = getSession();
  if (session) {
    // CTA butonlarının metnini güncelle
    document.querySelectorAll('[onclick*="openModal"]').forEach(function(el) {
      if (el.tagName === 'BUTTON' && el.textContent.includes('Ücretsiz')) {
        el.textContent = 'Panele Git';
      }
    });
  }

  // Modal overlay tıklama
  var overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });
  }

  // ESC ile kapat
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });

  // ——— GİRİŞ FORMU SUBMIT ———
  var girisBtn = document.getElementById('girisBtn');
  if (girisBtn) {
    girisBtn.addEventListener('click', function() {
      var email = document.getElementById('girisEmail').value.trim();
      var sifre = document.getElementById('girisSifre').value.trim();
      var hata = document.getElementById('girisHata');

      if (!email || !sifre) {
        hata.textContent = 'Lütfen tüm alanları doldurun.';
        return;
      }

      var sonuc = login(email, sifre);
      if (sonuc.basarili) {
        closeModal();
        navbarGuncelle();
        showToast('Hoş geldiniz, ' + sonuc.kullanici.ad.split(' ')[0] + '! 🎉', 'basari');
      } else {
        hata.textContent = sonuc.mesaj;
      }
    });
  }

  // ——— KAYIT FORMU SUBMIT ———
  var kayitBtn = document.getElementById('kayitBtn');
  if (kayitBtn) {
    kayitBtn.addEventListener('click', function() {
      var ad    = document.getElementById('kayitAd').value.trim();
      var email = document.getElementById('kayitEmail').value.trim();
      var sifre = document.getElementById('kayitSifre').value.trim();
      var hata  = document.getElementById('kayitHata');

      if (!ad || !email || !sifre) {
        hata.textContent = 'Lütfen tüm alanları doldurun.';
        return;
      }
      if (sifre.length < 6) {
        hata.textContent = 'Şifre en az 6 karakter olmalıdır.';
        return;
      }
      if (!email.includes('@')) {
        hata.textContent = 'Geçerli bir e-posta adresi girin.';
        return;
      }

      var sonuc = register(ad, email, sifre);
      if (sonuc.basarili) {
        closeModal();
        navbarGuncelle();
        showToast('Hesabınız oluşturuldu! Hoş geldiniz 🚀', 'basari');
      } else {
        hata.textContent = sonuc.mesaj;
      }
    });
  }

  // ——— SEKTÖR ETİKETLERİ ———
  document.querySelectorAll('.sector-tag').forEach(function(tag) {
    tag.addEventListener('click', function() {
      document.querySelectorAll('.sector-tag').forEach(function(t) { t.classList.remove('active'); });
      tag.classList.add('active');
    });
  });

  // ——— SSS ACCORDION ———
  document.querySelectorAll('.faq-question').forEach(function(q) {
    q.addEventListener('click', function() {
      var item = q.parentElement;
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  // ——— BUTON SES EFEKTİ ———
  function playClick() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}
  }

  document.querySelectorAll('button').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (btn.id !== 'musicBtn') playClick();
    });
  });

  // ——— MÜZİK ÇALAR ———
  var audioCtx = null, musicSource = null, musicPlaying = false;
  var musicBuf = null, musicStartTime = 0, musicOffset = 0;

  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function createMusicBuffer(ctx) {
    var bpm = 90, beat = 60 / bpm;
    var notes = [261.63, 293.66, 329.63, 392.00, 329.63, 293.66, 261.63, 392.00];
    var totalDur = notes.length * beat * 2;
    var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * totalDur), ctx.sampleRate);
    var data = buf.getChannelData(0);
    notes.forEach(function(freq, i) {
      var start = Math.floor(i * beat * 2 * ctx.sampleRate);
      var dur = Math.floor(beat * 1.6 * ctx.sampleRate);
      for (var s = 0; s < dur && (start + s) < data.length; s++) {
        var t = s / ctx.sampleRate;
        var env = s < 800 ? s / 800 : (s > dur - 1600 ? (dur - s) / 1600 : 1);
        data[start + s] = (Math.sin(2 * Math.PI * freq * t) * 0.18 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.06) * env;
      }
    });
    return buf;
  }

  function playMusicLoop() {
    var ctx = getAudioCtx();
    if (!musicBuf) musicBuf = createMusicBuffer(ctx);
    musicSource = ctx.createBufferSource();
    musicSource.buffer = musicBuf;
    musicSource.loop = true;
    var gain = ctx.createGain();
    gain.gain.value = 0.5;
    musicSource.connect(gain);
    gain.connect(ctx.destination);
    musicSource.start(0, musicOffset % musicBuf.duration);
    musicStartTime = ctx.currentTime;
  }

  window.toggleMusic = function() {
    var btn = document.getElementById('musicBtn');
    var wave = document.getElementById('musicWave');
    if (!btn || !wave) return;
    if (musicPlaying) {
      var ctx = getAudioCtx();
      musicOffset = (musicOffset + ctx.currentTime - musicStartTime) % (musicBuf ? musicBuf.duration : 1);
      try { musicSource.stop(); } catch(e) {}
      btn.textContent = '▶';
      wave.classList.add('paused');
      musicPlaying = false;
    } else {
      playMusicLoop();
      btn.textContent = '⏸';
      wave.classList.remove('paused');
      musicPlaying = true;
    }
  };

});
