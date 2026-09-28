# deneme-psikolog-1 — Dr. Elif Karasu Klinik Psikoloji Web Sitesi

Kıdemli (Senior) bir klinik psikoloğun entelektüel derinliğini, mesleki kıdemini ve akademik portfolyosunu yansıtan, etik kurallar çerçevesinde randevu dönüşümü sağlayan, yayınlanabilir (production-ready) web sitesi.

GitHub Pages üzerinde doğrudan (ek bir build adımı veya framework bağımlılığı olmaksızın) çalışacak şekilde saf HTML5, modern CSS3 ve vanilla JavaScript ile inşa edilmiştir.

---

## 🏛️ Tasarım Sistemi & Mimari

- **Tasarım Dili:** Asimetrik Brutalizm & Editoryal Minimalizm (Prestijli bir bağımsız psikoloji dergisi / akademik arşiv estetiği).
- **Renk Paleti:**
  - `Arka Plan:` `#FBF9F6` (Alabaster / Kırık Fildişi)
  - `Metin / Tipografi:` `#1A2624` (Deep Spruce / Derin Mat Yeşil-Siyah)
  - `Vurgu / Odak (CTA):` `#C47B5A` (Terrakotta / Sıcak Toprak)
  - `Çizgiler / Ayrım:` `#E5E0D8` (İnce Editoryal Çizgiler)
- **Tipografi:** *Playfair Display* (Serif başlıklar) & *Inter* (Sans-serif gövde metinleri).
- **Kurallar:** 8px grid sistemi, sıfır box-shadow, keskin hatlar (max 4px border-radius).

---

## 📂 Sayfa Yapısı

| Dosya | Açıklama |
|---|---|
| `index.html` | **Ana Sayfa:** Hero alanı, akademik kıdem bandı, 3 adımlı yaklaşım, çalışma alanları editoryal ızgarası, alıntı ve randevu CTA'sı. |
| `hakkimda.html` | **Hakkımda:** Akademik özgeçmiş (Boğaziçi, ODTÜ, İÜ doktora), ISST Şema Terapi akreditasyonu, süpervizyon felsefesi ve timeline. |
| `calisma-alanlari.html` | **Çalışma Alanları:** Kaygı, depresyon, travma, ilişki dinamikleri, varoluşsal krizler ve yas süreçleri üzerine derinlikli seans detayları. |
| `vaka-yaklasimlari.html` | **Vaka Yaklaşımları:** Etik kurallara uygun biçimde anonimleştirilmiş 3 klinik vaka ve 4 aşamalı terapötik süreç haritaları. |
| `iletisim.html` | **İletişim & Randevu:** Sürtünmesiz ön görüşme formu (CSRF, honeypot ve validasyon korumalı), Nişantaşı adres & ulaşım rehberi, klinik çerçeve SSS. |
| `gizlilik-politikasi.html` | **Hukuki / KVKK:** 6698 sayılı KVKK ve GDPR uyumlu tam aydınlatma metni ve veri sorumlusu bilgilendirmesi. |
| `404.html` | **Hata Sayfası:** Arama motorları için `noindex` etiketli, temaya uygun özel 404 sayfası. |
| `css/style.css` | 1400+ satırlık eksiksiz, modüler, erişilebilir ve responsive tasarım sistemi. |
| `js/main.js` | Mobil navigasyon menüsü, scroll animasyonları (`prefers-reduced-motion` destekli), FAQ akordeonu, form validasyonu ve çerez onayı. |
| `favicon.svg` | Özel tasarım tipografik monogram SVG favicon. |
| `site.webmanifest` | PWA mobil ana ekran uyumluluğu. |
| `robots.txt` & `sitemap.xml` | SEO ve dizinleme altyapısı. |
| `.nojekyll` | GitHub Pages'in Jekyll derlemesini atlayıp dosyaları doğrudan servis etmesi için konfigürasyon. |

---

## 🚀 GitHub Pages Üzerinde Yayına Alma

1. Depoyu GitHub'a gönderin (`git push -u origin main`).
2. GitHub'da deponun **Settings** sekmesine gidin.
3. Sol menüden **Pages** bölümünü seçin.
4. **Build and deployment > Branch** kısmında:
   - Branch: `main`
   - Folder: `/ (root)` seçip **Save** butonuna tıklayın.
5. Birkaç dakika içinde siteniz `https://anilmetey.github.io/deneme-psikolog-1/` adresinde canlıya geçecektir.
