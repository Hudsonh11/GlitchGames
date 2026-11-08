import React from 'react';
import GlitchLoader from '@/components/GlitchLoader';

interface UltraLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

/** Kept for existing callers; now shows a Glitch Games mascot loader. */
const UltraLoadingSpinner: React.FC<UltraLoadingSpinnerProps> = ({ size = 'md', text = 'Loading...' }) => (
  <GlitchLoader size={size === 'sm' ? 'md' : 'lg'} text={text} slot="page-loader" />
);

export default UltraLoadingSpinner;
