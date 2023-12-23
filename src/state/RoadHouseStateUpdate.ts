import { PositionStateType } from "./PositionState";

export interface IRoadHouseStateUpdate {
    i: number;
    j: number;
    k: number;
    player: string;
    placementGoal: PositionStateType;
}

export class RoadHouseStateUpdate implements IRoadHouseStateUpdate {
    constructor(
      public i: number, public j: number, public k: number,
      public player:string,
      public placementGoal: PositionStateType
    ) { }
  }