import { Color, Coodrs, FENChar } from "../models";

export abstract class Piece {
    protected abstract _FENChar: FENChar;
    protected abstract _directions: Coodrs[];
    constructor(private _color: Color) {
        
    }
    public get FENChar():FENChar{
        return this._FENChar;
    }
    public get directions():Coodrs[]{
        return this._directions;
    }
    public get color(): Color {
        return this._color;
    }
}