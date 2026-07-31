import { Color } from "three";

export const BOARD_COLORS = {
  light: new Color("#b8a88a"),
  dark: new Color("#5d7a45"),
  frame: new Color("#26262b"),
  frameMetalness: 0.75,
  frameRoughness: 0.3,
  squareMetalness: 0.02,
  squareRoughness: 0.8,
  highlight: new Color("#22c55e"),
} as const;

export const PIECE_COLORS = {
  white: new Color("#e8e2d4"),
  black: new Color("#26262e"),
  whiteMetalness: 0.15,
  blackMetalness: 0.25,
  whiteRoughness: 0.4,
  blackRoughness: 0.35,
} as const;
