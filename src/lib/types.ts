
export type UniqueId = number;
export interface HasId {
  id: UniqueId;
}

export type GridKey = string;
export interface GridPoint {
  x: number;
  y: number;
}
export const NeutralSpace: GridKey = '0,0';

export enum Team {
  Red,
  Blue,
};
export enum Unit {
  Infantry,
  MissleTank,
  Gev,
  HeavyTank,
  Howitzer,
  LightGev,
  CruiseMissiles,
  Ogre,
  OgreDamaged,
}

export interface HasKey {
  key: GridKey;
}
export interface OgreCard extends HasId {
  readonly team: Team;
  readonly unit: Unit;
}
export interface OgreSquare extends HasKey, OgreCard { }
export interface BoardSquare extends HasKey {
  square?: OgreSquare;
}

export interface HasState<T> {
  getState(): T;
  loadState(state: T): void;
}
export interface PlayerState {
  readonly team: Team;
  readonly hand: OgreCard[];
  readonly library: OgreCard[];
  readonly board: OgreSquare[];
  readonly discard: OgreCard[];
}

export interface GameState {
  readonly red: PlayerState;
  readonly blue: PlayerState;
  readonly turn: number;
}