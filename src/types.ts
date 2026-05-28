/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Shared type definitions for Torshita Banerjee's birthday wishes client application.

export interface Star {
  id: number;
  x: number; // percentage width 0-100
  y: number; // percentage height 0-100
  size: number; // pixel diameter
  twinkleStyle: number; // index for animation duration/delay
  color: string;
}

export interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  length: number;
  speed: number;
  delay: number;
}

export type FlowerType = 'rose' | 'sakura' | 'daisy';

export interface FlowerPetal {
  id: number;
  x: number; // left start value %
  y: number; // current vertical offset px
  size: number; // relative size scale factor
  speed: number; // fall rate factor
  swaySpeed: number; // side-to-side rate factor
  swayAmplitude: number; // horizontal boundary
  spinSpeed: number; // rotational angle speed degrees
  opacity: number;
  flowerType: FlowerType;
  color: string;
}

export interface SheepItem {
  id: number;
  x: number; // px horizontal
  y: number; // px vertical
  vx: number; // horizontal speed
  vy: number; // vertical speed
  scale: number; // size multiplier
  angle: number; // current rotation angle in degrees
  angularSpeed: number; // rotation speed degrees/frame
  type: 'baby' | 'standard' | 'deep' | 'derp';
  color: string; // sheep coat color (white, pastel pink, purple, blue, gold etc!)
}

export interface LandmarkWish {
  id: number;
  title: string;
  wish: string;
  unwrapped: boolean;
  color: string;
}
