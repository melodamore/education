export interface Analogy {
  topic: string;
  analogyEn: string;
  analogyAm: string;
}

export const culturalAnalogies: { [key: string]: Analogy } = {
  // FIXED: Key must exactly match the lowercase keyword from your JSON
  "thermal equilibrium": {
    topic: "Heat Capacity",
    analogyEn: "Think of a traditional clay coffee pot (Jebena). It takes longer to heat up than a metal pot, but it holds heat for a long time. Water has a high heat capacity, acting just like a clay Jebena.",
    analogyAm: "ስለ ባሕላዊ የሸክላ ጀበና ያስቡ። ከብረት ብረት ምጣድ ይልቅ ለመሞቅ ረዘም ያለ ጊዜ ይወስዳል፡ ነገር ግን ሙቀትን ለረጅም ጊዜ ይይዛል። ውሃ ከፍተኛ የሙቀት አቅም አለው፡ ልክ እንደ ሸክላ ጀበና ይሠራል።"
  }
};