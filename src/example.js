import 'babel-polyfill';
import Picture from './';
import React from 'react';

// const sources = [
//   { url: 'https://placehold.it/1792x1008', width: 896, height: 504, dppx: 2 },
//   { url: 'https://placehold.it/896x504', width: 896, height: 504, dppx: 1 },
//   { url: 'https://placehold.it/1536x864', width: 768, height: 432, dppx: 2 },
//   { url: 'https://placehold.it/768x432', width: 768, height: 432, dppx: 1 },
//   { url: 'https://placehold.it/1280x720', width: 640, height: 360, dppx: 2 },
//   { url: 'https://placehold.it/640x470', width: 640, height: 360, dppx: 1 },
//   { url: 'https://placehold.it/1024x768', width: 512, height: 384, dppx: 2 },
//   { url: 'https://placehold.it/512x384', width: 512, height: 384, dppx: 1 },
//   { url: 'https://placehold.it/768x768', width: 384, height: 384, dppx: 2 },
//   { url: 'https://placehold.it/384x288', width: 384, height: 384, dppx: 1 },
//   { url: 'https://placehold.it/512x768', width: 256, height: 384, dppx: 2 },
//   { url: 'https://placehold.it/256x384', width: 256, height: 384, dppx: 1 },
// ];
const sources = [
  { url: '/assets/example.svg', mime: 'image/svg+xml' },
];
export default (
  <Picture
    sources={sources}
    alt="this is the image description"
  />
);
