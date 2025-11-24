/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

// Mock for next/image to work inside Jest tests
export default function Image(props) {
  return <img {...props} />;
}
