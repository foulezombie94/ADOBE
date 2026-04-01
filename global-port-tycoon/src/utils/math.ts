import Decimal from "break_infinity.js";

const SUFFIXES = [
  "", "K", "M", "B", "T", "aa", "ab", "ac", "ad", "ae", "af", "ag", "ah", "ai", "aj", 
  "ak", "al", "am", "an", "ao", "ap", "aq", "ar", "as", "at", "au", "av", "aw", "ax", "ay", "az",
  "ba", "bb", "bc", "bd", "be", "bf", "bg", "bh", "bi", "bj"
];

export const formatCurrency = (value: Decimal | number | string): string => {
  const dec = new Decimal(value);

  // Pour les petits nombres, pas de décimales inutiles
  if (dec.lt(1000)) return dec.floor().toString();
  
  const exponent = dec.e;
  const suffixIndex = Math.floor(exponent / 3);
  
  if (suffixIndex < SUFFIXES.length) {
    let shortValue = dec.dividedBy(Decimal.pow(10, suffixIndex * 3)).toNumber();
    
    // Correction de l'arrondi "1000.00"
    if (parseFloat(shortValue.toFixed(2)) >= 1000) {
      shortValue /= 1000;
      return `${shortValue.toFixed(2)}${SUFFIXES[suffixIndex + 1]}`;
    }

    return `${shortValue.toFixed(2)}${SUFFIXES[suffixIndex]}`;
  }
  
  // Notation scientifique pour les nombres gigantesques (au-delà de "bj")
  return dec.toExponential(2).replace("e+", "e");
};
