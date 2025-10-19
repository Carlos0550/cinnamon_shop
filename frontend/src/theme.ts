import { createTheme } from '@mantine/core';
import type { MantineColorsTuple } from '@mantine/core';

const rose: MantineColorsTuple = [
  '#fff5f7',
  '#ffe9ef',
  '#ffd2df',
  '#ffb0c6',
  '#ff85a7',
  '#ff5586',
  '#ff2f6c',
  '#e61c5b',
  '#c3124a',
  '#8a0735',
];

export const theme = createTheme({
  colors: {
    rose,
    kuromi: [
      '#f7f5ff', // 0 very light
      '#ece8ff', // 1
      '#d7d1ff', // 2
      '#b9aeff', // 3
      '#9787f5', // 4
      '#7a67e6', // 5 primary mid purple
      '#624fd1', // 6
      '#4f3fb1', // 7
      '#3f338f', // 8
      '#2b2364', // 9 deep purple
    ] as MantineColorsTuple,
  },
  primaryColor: 'rose',
  primaryShade: { light: 6, dark: 6 },
  defaultRadius: 'md',
});