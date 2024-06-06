import { Color, Coodrs, FENChar } from "../models";
import { Piece } from "./piece";

export class King extends Piece{
    private _hasMoved : boolean = false;
    protected override _FENChar: FENChar;
    protected override _directions: Coodrs[]=[
        {x: 0 , y: 1},
        {x: 0 , y: -1},
        {x: 1 , y: 0},
        {x: 1 , y: 1},
        {x: 1 , y: -1},
        {x: -1 , y: -1},
        {x: -1 , y: 1},
        {x: -1 , y: 0}
    ];
    constructor(private pieceColor:Color){
        super(pieceColor);
        this._FENChar = pieceColor === Color.White? FENChar.WhiteKing : FENChar.BlackKing;
    }
    public get hasMoved():boolean{
        return this.hasMoved;
    }
    public set hasMoved(_){
        this.hasMoved=true;
    }
}