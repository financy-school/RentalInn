import React from 'react';
import {SvgUri} from 'react-native-svg';
import {getFontSize} from '../../theme/standardTextUtils';
import {IconButton, useTheme} from 'react-native-paper';

/**
 * StandardSvg
 *
 * - Supports vector icons (via react-native-paper)
 * - Supports remote SVGs (via SvgUri)
 * - Theme-aware colors
 */
const StandardSvg = ({icon, size = 'md', uri, iconColor}) => {
  const {colors} = useTheme();
  const dimension = getFontSize(size);

  // If a URI is provided, render a remote SVG
  // if (uri) {
  //   return <SvgUri uri={uri} height={dimension} width={dimension} />;
  // }

  // Otherwise render an IconButton
  return (
    <IconButton
      icon={icon} // ✅ dynamic icon name
      iconColor={iconColor ?? colors.onSurface} // ✅ theme-aware, overrideable
      style={{
        backgroundColor: colors.surfaceVariant,
        padding: 0,
        borderRadius: dimension, // make it circular
        elevation: 2,
      }}
      size={dimension}
    />
  );
};

export default StandardSvg;
