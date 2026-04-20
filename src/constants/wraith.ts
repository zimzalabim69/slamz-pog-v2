// src/constants/wraith.ts

export const WRAITH_PROFILE = {
  name: "The Wraith",
  title: "Last Dev Standing",
  backstory: "Solo dev from '99. Never made it. Refused patches, 3D, online, AI. Hid inside this cabinet. Been dodging the final update since 2000. Now he steals joy instead of creating it.",
  personality: "Bitter, lonely, sarcastic, scared of change. Sees the player as both mirror and threat.",
};

export const WRAITH_GLITCH_TAUNTS = {
  early: [
    "u th1nk ur sp3c14l?",
    "1 w4s h3r3 b3f0r3 u",
    "k33p sl4mm1ng... 1t f33ds m3",
    "pr0gr3ss 1s 4 l13",
    "y0u 4r3 n0t th3 h3r0",
  ],
  mid: [
    "why d0 y0u f1ght?",
    "w3 4r3 n0t s0 d1ff3r3nt",
    "3v3ry p4tch k1lls 4 p13c3 0f m3",
    "y0u 4r3 th3 v1rus n0w",
    "th1s 4rc4d3 n3v3r d13d",
  ],
  late: [
    "1f y0u w1n... wh4t h4pp3ns t0 m3?",
    "w4s 4ny 0f th1s r34l?",
    "1 w4s 4fr41d 0f th3 upd4t3",
    "m4yb3 1 w4s wr0ng...",
    "t00 l4t3 t0 p4tch m3 n0w",
  ],
  special: [
    "fs0c13ty s3nds 1ts r3g4rds",
    "y0u c4nt d3l3t3 wh4t y0u d0nt und3rst4nd",
    "th3 4rc4d3 1s w41t1ng",
  ]
};

export function getWraithTaunt(stage: 'early' | 'mid' | 'late' | 'special' = 'early'): string {
  const pool = WRAITH_GLITCH_TAUNTS[stage];
  let text = pool[Math.floor(Math.random() * pool.length)];

  // Extra glitch corruption
  text = text
    .replace(/a/gi, '4')
    .replace(/e/gi, '3')
    .replace(/i/gi, '1')
    .replace(/o/gi, '0')
    .replace(/s/gi, '$')
    .replace(/t/gi, '7')
    .replace(/you/gi, 'U');

  return text.toUpperCase();
}
