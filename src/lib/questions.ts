export type Question = {
  q: string
  options: [string, string, string, string]
  correct: 0 | 1 | 2 | 3
  category: string
}

export const QUESTIONS: Question[] = [
  { category: 'Tarih', q: 'İstanbul hangi yıl fethedildi?', options: ['1451', '1453', '1492', '1520'], correct: 1 },
  { category: 'Coğrafya', q: "Türkiye'nin en uzun nehri hangisidir?", options: ['Kızılırmak', 'Fırat', 'Sakarya', 'Yeşilırmak'], correct: 0 },
  { category: 'Bilim', q: 'Suyun kimyasal formülü nedir?', options: ['CO₂', 'H₂O', 'O₂', 'NaCl'], correct: 1 },
  { category: 'Spor', q: 'Bir futbol takımında sahada kaç oyuncu bulunur?', options: ['9', '10', '11', '12'], correct: 2 },
  { category: 'Coğrafya', q: "Türkiye'nin başkenti neresidir?", options: ['İstanbul', 'İzmir', 'Ankara', 'Bursa'], correct: 2 },
  { category: 'Bilim', q: 'Güneş sisteminin en büyük gezegeni hangisidir?', options: ['Dünya', 'Jüpiter', 'Satürn', 'Mars'], correct: 1 },
  { category: 'Sinema', q: 'Titanic filminin yönetmeni kimdir?', options: ['Steven Spielberg', 'James Cameron', 'Christopher Nolan', 'Ridley Scott'], correct: 1 },
  { category: 'Tarih', q: 'Türkiye Cumhuriyeti hangi yıl kuruldu?', options: ['1919', '1920', '1923', '1938'], correct: 2 },
  { category: 'Coğrafya', q: 'Dünyanın en yüksek dağı hangisidir?', options: ['K2', 'Everest', 'Ağrı Dağı', 'Kilimanjaro'], correct: 1 },
  { category: 'Bilim', q: 'İnsan vücudundaki en büyük organ hangisidir?', options: ['Kalp', 'Beyin', 'Deri', 'Karaciğer'], correct: 2 },
  { category: 'Müzik', q: 'Bir oktavda kaç temel nota vardır?', options: ['5', '7', '8', '12'], correct: 1 },
  { category: 'Spor', q: 'Basketbolda normal bir sayı kaç puandır?', options: ['1', '2', '3', '4'], correct: 1 },
  { category: 'Genel Kültür', q: 'Gökkuşağında kaç renk vardır?', options: ['5', '6', '7', '8'], correct: 2 },
  { category: 'Coğrafya', q: "Hangi ülke 'Güneşin Doğduğu Ülke' olarak bilinir?", options: ['Çin', 'Japonya', 'Kore', 'Tayland'], correct: 1 },
  { category: 'Bilim', q: 'Ampulü kim icat etti?', options: ['Newton', 'Einstein', 'Edison', 'Tesla'], correct: 2 },
  { category: 'Tarih', q: 'Kurtuluş Savaşı hangi yıl başladı?', options: ['1919', '1920', '1922', '1923'], correct: 0 },
  { category: 'Sinema', q: "'Matrix' filminde ana karakterin adı nedir?", options: ['Neo', 'Morpheus', 'Trinity', 'Smith'], correct: 0 },
  { category: 'Coğrafya', q: 'Türkiye kaç coğrafi bölgeye ayrılır?', options: ['5', '6', '7', '8'], correct: 2 },
  { category: 'Bilim', q: 'Kana kırmızı rengini veren madde nedir?', options: ['Hemoglobin', 'Melanin', 'Klorofil', 'Keratin'], correct: 0 },
  { category: 'Genel Kültür', q: 'Bir yılda kaç mevsim vardır?', options: ['2', '3', '4', '5'], correct: 2 },
  { category: 'Müzik', q: 'Standart bir piyanoda kaç tuş vardır?', options: ['61', '76', '88', '100'], correct: 2 },
  { category: 'Spor', q: 'Olimpiyat oyunları kaç yılda bir düzenlenir?', options: ['2', '3', '4', '5'], correct: 2 },
  { category: 'Tarih', q: "Osmanlı Devleti'nin kurucusu kimdir?", options: ['Fatih Sultan Mehmet', 'Osman Bey', 'Kanuni', 'Orhan Gazi'], correct: 1 },
  { category: 'Bilim', q: "Hangi gezegen 'Kızıl Gezegen' olarak bilinir?", options: ['Venüs', 'Mars', 'Jüpiter', 'Merkür'], correct: 1 },
]

export function pickQuestions(n: number): Question[] {
  const shuffled = [...QUESTIONS]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, n)
}
