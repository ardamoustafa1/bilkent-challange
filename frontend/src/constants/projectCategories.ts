import type { ProjectCategoryTree } from "@/types";

export const PROJECT_CATEGORIES: ProjectCategoryTree[] = [
  {
    main: "Eğitim Teknolojileri ve Öğrenme Dönüşümü",
    mainSDG: "SDG-4 – Nitelikli Eğitim",
    def: "Öğrenme süreçlerini daha verimli, kişiselleştirilmiş ve ölçülebilir hale getiren AI destekli eğitim çözümleri.",
    subs: [
      { name: "AI destekli öğrenme asistanları", sdgs: ["SDG-4 – Nitelikli Eğitim", "SDG-9 – Sanayi, Yenilikçilik ve Altyapı"], def: "Öğrencinin sorularına cevap veren, konu anlatan veya yönlendirme yapan dijital rehber sistemler." },
      { name: "Kişiselleştirilmiş öğrenme sistemleri", sdgs: ["SDG-4 – Nitelikli Eğitim"], def: "Öğrencinin seviyesine göre içerik öneren ve öğrenme yolunu uyarlayan platformlar." },
      { name: "Sınav hazırlık analitiği", sdgs: ["SDG-4 – Nitelikli Eğitim"], def: "Deneme sonuçlarını analiz ederek güçlü ve zayıf alanları gösteren sistemler." },
      { name: "Mentorluk ve kariyer koçluğu sistemleri", sdgs: ["SDG-4 – Nitelikli Eğitim", "SDG-8 – İnsana Yakışır İş ve Ekonomik Büyüme"], def: "Öğrencinin ilgi alanlarına göre rehberlik sunan, kariyer yönlendirme yapan uygulamalar." },
      { name: "Oyunlaştırılmış eğitim platformları", sdgs: ["SDG-4 – Nitelikli Eğitim"], def: "Rozet, puan ve görev sistemleriyle öğrenmeyi daha eğlenceli ve sürdürülebilir hale getiren çözümler." },
    ],
  },
  {
    main: "Sürdürülebilirlik ve İklim Çözümleri",
    mainSDG: "SDG-13 – İklim Eylemi",
    def: "Çevresel sorunlara yönelik veri temelli analiz, izleme ve çözüm önerileri geliştiren sürdürülebilirlik projeleri.",
    subs: [
      { name: "Karbon ayak izi hesaplayıcılar", sdgs: ["SDG-13 – İklim Eylemi", "SDG-12 – Sorumlu Üretim ve Tüketim"], def: "Bireylerin veya kurumların karbon salımını hesaplayan ve azaltım önerileri sunan sistemler." },
      { name: "Enerji verimliliği izleme", sdgs: ["SDG-7 – Erişilebilir ve Temiz Enerji", "SDG-13 – İklim Eylemi"], def: "Enerji tüketimini analiz eden, tasarruf fırsatlarını gösteren çözümler." },
      { name: "Atık yönetimi ve geri dönüşüm sistemleri", sdgs: ["SDG-12 – Sorumlu Üretim ve Tüketim"], def: "Atıkların ayrıştırılması, geri dönüşüm süreçlerinin optimize edilmesi için AI destekli çözümler." },
      { name: "Su kaynakları yönetimi", sdgs: ["SDG-6 – Temiz Su ve Sanitasyon"], def: "Su tüketimini izleyen, israfı önleyen ve kaynakları verimli kullandıran sistemler." },
    ],
  },
  {
    main: "Sağlık ve Yaşam Kalitesi",
    mainSDG: "SDG-3 – Sağlıklı ve Kaliteli Yaşam",
    def: "Sağlık hizmetlerinin iyileştirilmesi, yaşam kalitesinin artırılması ve bireysel sağlık yönetimini destekleyen projeler.",
    subs: [
      { name: "Dijital sağlık asistanları", sdgs: ["SDG-3 – Sağlıklı ve Kaliteli Yaşam"], def: "Sağlıkla ilgili soruları yanıtlayan veya yönlendirme yapan AI tabanlı rehber uygulamalar." },
      { name: "Mental sağlık destek çözümleri", sdgs: ["SDG-3 – Sağlıklı ve Kaliteli Yaşam"], def: "Stres yönetimi, duygu takibi ve psikolojik destek sağlayan dijital platformlar." },
      { name: "Akıllı spor ve aktivite takibi", sdgs: ["SDG-3 – Sağlıklı ve Kaliteli Yaşam"], def: "Fiziksel aktiviteyi izleyen, öneriler sunan ve motivasyonu artıran sistemler." },
    ],
  },
  {
    main: "Toplumsal Fayda ve Eşitlik",
    mainSDG: "SDG-10 – Eşitsizliklerin Azaltılması",
    def: "Toplumsal eşitlik, erişilebilirlik, engelli destekleri ve sosyal refahı artırmaya yönelik projeler.",
    subs: [
      { name: "Engelli bireyler için erişilebilirlik çözümleri", sdgs: ["SDG-10 – Eşitsizliklerin Azaltılması", "SDG-3 – Sağlıklı ve Kaliteli Yaşam"], def: "Engelli bireylerin eğitim, ulaşım veya günlük yaşamda daha bağımsız olmasını sağlayan çözümler." },
      { name: "Sosyal yardım ve ihtiyaç analizi", sdgs: ["SDG-1 – Yoksulluğa Son", "SDG-10 – Eşitsizliklerin Azaltılması"], def: "Sosyal yardımların daha adil dağıtılması için ihtiyaç analizi yapan sistemler." },
    ],
  },
  {
    main: "Akıllı Şehirler ve Altyapı",
    mainSDG: "SDG-11 – Sürdürülebilir Şehirler ve Topluluklar",
    def: "Şehir yaşamını daha güvenli, verimli ve sürdürülebilir hale getiren AI destekli altyapı projeleri.",
    subs: [
      { name: "Trafik yönetimi ve akıllı ulaşım", sdgs: ["SDG-11 – Sürdürülebilir Şehirler ve Topluluklar", "SDG-9 – Sanayi, Yenilikçilik ve Altyapı"], def: "Trafik akışını optimize eden, toplu ulaşımı iyileştiren çözümler." },
      { name: "Güvenlik ve afet yönetimi", sdgs: ["SDG-11 – Sürdürülebilir Şehirler ve Topluluklar", "SDG-13 – İklim Eylemi"], def: "Afet risklerini analiz eden, erken uyarı sağlayan ve güvenlik süreçlerini destekleyen sistemler." },
    ],
  },
  {
    main: "Ekonomi, Finans ve İş Dünyası",
    mainSDG: "SDG-8 – İnsana Yakışır İş ve Ekonomik Büyüme",
    def: "Finansal analiz, iş süreçleri, girişimcilik ve verimlilik odaklı AI projeleri.",
    subs: [
      { name: "KOBİ dijital dönüşüm çözümleri", sdgs: ["SDG-8 – İnsana Yakışır İş ve Ekonomik Büyüme", "SDG-9 – Sanayi, Yenilikçilik ve Altyapı"], def: "KOBİ'lerin süreçlerini optimize eden AI araçları." },
      { name: "Verimlilik ve süreç otomasyonu", sdgs: ["SDG-9 – Sanayi, Yenilikçilik ve Altyapı"], def: "İş süreçlerini hızlandıran, manuel işleri azaltan AI tabanlı otomasyon projeleri." },
    ],
  },
];
