import React from 'react';

// Safe Jest mock for `next/image`.
// Only forwards safe DOM props so React doesn't warn during tests.
export default function Image(props) {
  const { src, alt, width, height, className, style } = props || {};

  const safeProps = {};
  if (src !== undefined)
    safeProps.src = typeof src === 'string' ? src : String(src);
  if (alt !== undefined) safeProps.alt = alt;
  if (className) safeProps.className = className;
  if (width !== undefined) safeProps.width = width;
  if (height !== undefined) safeProps.height = height;
  if (style) safeProps.style = style;

  return React.createElement('img', safeProps);
}
