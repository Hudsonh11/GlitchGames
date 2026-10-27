import React from 'react';
import type { CelebrationTheme } from '@/lib/celebrationTheme';

/** All artwork stays inside the parent circular viewport. */
export default function SeasonalCharacter({ theme }: { theme: CelebrationTheme }) {
  const halloween = theme.key === 'halloween';
  const christmas = theme.key === 'christmas';
  const easter = theme.key === 'easter';
  const love = theme.key === 'valentine';
  const lucky = theme.key === 'stpatrick';
  const summer = theme.key === 'summer';
  return (
    <svg viewBox="0 0 280 280" className="payment-character-scene" aria-hidden="true">
      <ellipse cx="140" cy="230" rx="67" ry="9" className="payment-ground" />
      <g className="payment-sparkles">
        {Array.from({ length: 14 }, (_, i) => {
          const x = 24 + (i * 43) % 232;
          const y = 22 + (i * 31) % 175;
          return christmas ? (
            <circle key={i} cx={x} cy={y} r={i % 3 + 2} className="payment-snow" />
          ) : love ? (
            <path key={i} transform={`translate(${x} ${y}) scale(.55)`} d="M0 5 C-12 -6 -14 8 0 17 C14 8 12 -6 0 5" className="payment-heart" />
          ) : (
            <path key={i} transform={`translate(${x} ${y}) rotate(${i * 27})`} d={i % 2 ? 'M-3 -6 H3 V6 H-3Z' : 'M0 -6 L2 -2 L6 0 L2 2 L0 6 L-2 2 L-6 0 L-2 -2Z'} className={`payment-confetti payment-confetti-${i % 3}`} />
          );
        })}
      </g>
      <g className="payment-character-bounce">
        {easter && <g className="payment-character-body"><ellipse cx="115" cy="69" rx="13" ry="35" transform="rotate(-12 115 69)" /><ellipse cx="164" cy="69" rx="13" ry="35" transform="rotate(12 164 69)" /></g>}
        <path d={halloween ? 'M86 144 Q86 82 140 82 Q194 82 194 144 L194 215 Q181 199 170 216 Q157 199 144 216 Q131 199 118 216 Q103 199 86 215Z' : 'M91 138 Q91 92 140 92 Q189 92 189 138 L192 195 Q192 222 140 222 Q88 222 88 195Z'} className="payment-character-body" />
        <g className="payment-character-wave"><path d="M92 161 Q56 153 57 121" fill="none" strokeWidth="19" strokeLinecap="round" className="payment-character-limb" /><circle cx="57" cy="116" r="11" className="payment-character-body" /></g>
        <path d="M188 167 Q207 174 190 194" fill="none" strokeWidth="19" strokeLinecap="round" className="payment-character-limb" />
        {halloween && <g><path d="M100 94 L124 40 L169 94Z" className="payment-hat" /><path d="M90 94 Q140 80 190 94" fill="none" strokeWidth="12" strokeLinecap="round" className="payment-hat-stroke" /><path d="M115 67 L155 75" strokeWidth="9" className="payment-ribbon-stroke" /></g>}
        {christmas && <g><path d="M96 106 Q130 48 179 88 L202 88 L175 108Z" className="payment-hat" /><path d="M96 106 Q140 96 180 106" fill="none" strokeWidth="14" strokeLinecap="round" className="payment-snow-stroke" /><circle cx="202" cy="88" r="10" className="payment-snow" /></g>}
        {lucky && <g><path d="M107 98 L110 60 H168 L173 98Z" className="payment-hat" /><path d="M97 98 H181" strokeWidth="13" strokeLinecap="round" className="payment-hat-stroke" /><path d="M109 84 H170" strokeWidth="9" className="payment-ribbon-stroke" /></g>}
        {!halloween && !christmas && !easter && !lucky && !summer && <path d="M119 96 L140 48 L163 96Z" className="payment-party-hat" />}
        <g className="payment-face"><ellipse cx="122" cy="139" rx="4" ry="6" /><ellipse cx="157" cy="139" rx="4" ry="6" /><path d="M126 155 Q140 170 154 155" fill="none" strokeWidth="4" strokeLinecap="round" /></g>
        <ellipse cx="109" cy="151" rx="7" ry="4" className="payment-cheek" /><ellipse cx="169" cy="151" rx="7" ry="4" className="payment-cheek" />
        {summer && <g className="payment-face"><path d="M111 132 H132 V144 H111Z M148 132 H169 V144 H148Z" /><path d="M132 135 H148" strokeWidth="3" /></g>}
        <g className="payment-gift">
          {halloween ? <g><path d="M132 198 Q126 176 143 174" fill="none" strokeWidth="5" className="payment-ribbon-stroke" /><ellipse cx="145" cy="201" rx="27" ry="22" className="payment-gift-box" /><path d="M133 199 L138 192 L143 199 M150 199 L155 192 L160 199 M133 208 Q146 216 157 207" fill="none" strokeWidth="3" className="payment-face" /></g> : <g><rect x="116" y="181" width="52" height="42" rx="6" className="payment-gift-box" /><rect x="111" y="176" width="62" height="13" rx="4" className="payment-gift-lid" /><path d="M141 177 V223 M141 177 C112 176 125 152 141 177 C161 151 177 176 141 177" fill="none" strokeWidth="6" className="payment-ribbon-stroke" /></g>}
        </g>
      </g>
    </svg>
  );
}