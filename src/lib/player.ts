import { mapReduce } from ".";
import { Grid } from "./grid";
import { BlueBase, GridKey, HasState, OgreCard, OgreSquare, PlayerState, RedBase, Team, UniqueId, Unit } from "./types";
import { assertRemove, flatten, nextId, range, shuffle, unique } from "./util";

const DeckContents = [
  { count: 7, unit: Unit.Infantry, },
  { count: 5, unit: Unit.MissleTank, },
  { count: 3, unit: Unit.Gev, },
  { count: 3, unit: Unit.HeavyTank, },
  { count: 3, unit: Unit.Howitzer, },
  { count: 3, unit: Unit.LightGev, },
  { count: 2, unit: Unit.Ogre, },
];
function startingUnits(): Unit[] {
  return flatten(DeckContents.map(data => range(data.count).map(_ => data.unit)));
}

export class Player implements HasState<PlayerState> {
  private constructor(private state: PlayerState) { }
  getState() { return this.state; }
  loadState(state: PlayerState) { this.state = state; }

  getBase(): GridKey {
    return ({
      [Team.Red]: RedBase,
      [Team.Blue]: BlueBase,
    })[this.state.team];
  }
  getSquareFromBoard(key: GridKey): OgreSquare | undefined {
    return this.state.board.filter(os => os.key === key)[0];
  }
  getCardFromHand(id: UniqueId): OgreCard | undefined {
    return this.state.hand.filter(oc => oc.id === id)[0];
  }

  getAttacking(card: OgreCard, dest: GridKey): GridKey[] {
    const tempSquare = {
      ...card,
      key: dest,
    };
    const spotted = new Set(this.getSpotting());
    const possibleAttacks = Grid.getSpottedAttacks(tempSquare, spotted);
    const friendlySpaces = mapReduce(this.getState().board, os => os.key);
    const noFriendlyFire = possibleAttacks.filter(key => !friendlySpaces[key]);
    return noFriendlyFire;
  }
  getSpotting(): GridKey[] {
    return unique(flatten(this.state.board.map(os => Grid.getSpotting(os))));
  }
  getSupplied(): GridKey[] {
    const visited: Set<GridKey> = new Set();
    const toExplore: GridKey[] = [this.getBase()];
    const toSupply: GridKey[] = [];
    while (toExplore.length) {
      const next = toExplore.pop()!;
      visited.add(next);
      const square = this.getSquareFromBoard(next);
      if (square) {
        const canSupply = Grid.getSupply(square);
        const newSupply = canSupply.filter(key => !visited.has(key));
        toExplore.push(...newSupply);
      } else {
        toSupply.push(next);
      }
    }
    return toSupply;
  }

  drawForTurn(): void {
    const { hand, library } = this.state;
    const card = library.pop();
    if (card) {
      hand.push(card);
    }
  }
  playCard(card: OgreCard, deploy: GridKey): void {
    const { hand, board } = this.state;
    assertRemove(card, hand);
    if (card.unit !== Unit.CruiseMissiles) {
      board.push({
        ...card,
        key: deploy,
      });
    }
  }
  receiveAttack(square: OgreSquare) {
    const { board } = this.state;
    assertRemove(square, board);
    if (square.unit === Unit.Ogre) {
      board.push({
        key: square.key,
        team: square.team,
        id: nextId(),
        unit: Unit.OgreDamaged,
      });
    }
  }

  static create(team: Team) {
    const cards: OgreCard[] = startingUnits().map(unit => ({
      id: nextId(),
      team,
      unit,
    }));
    const library = shuffle(cards);
    const hand = [
      ...range(2).map(_ => ({
        id: nextId(),
        team,
        unit: Unit.CruiseMissiles,
      })),
      ...range(3).map(_ => library.pop()!),
    ];
    const state: PlayerState = {
      team,
      hand,
      library,
      board: [],
      discard: [],
    }
    return new Player(state);
  }
}