import { Piece } from "./pieces/piece";

export enum Color{
    White,
    Black
}
export type Coodrs = {
    x:number,
    y:number
}
export enum FENChar{
    WhitePawn="P",
    WhiteRook="R",
    WhiteBishop="B",
    WhiteQueen="Q",
    WhiteKnight="N",
    WhiteKing="K",
    BlackPawn="p",
    BlackRook="r",
    BlackBishop="b",
    BlackQueen="q",
    BlackKnight="n",
    BlackKing="k",
}

export const pieceImagePaths: Readonly<Record<FENChar,string>>={
    [FENChar.BlackBishop]:"assets/pieces/black bishop.svg",
    [FENChar.BlackKing]:"assets/pieces/black king.svg",
    [FENChar.BlackKnight]:"assets/pieces/black knight.svg",
    [FENChar.BlackPawn]:"assets/pieces/black pawn.svg",
    [FENChar.BlackQueen]:"assets/pieces/black queen.svg",
    [FENChar.BlackRook]:"assets/pieces/black rook.svg",
    [FENChar.WhiteBishop]:"assets/pieces/white bishop.svg",
    [FENChar.WhiteKing]:"assets/pieces/white king.svg",
    [FENChar.WhiteKnight]:"assets/pieces/white knight.svg",
    [FENChar.WhitePawn]:"assets/pieces/white pawn.svg",
    [FENChar.WhiteQueen]:"assets/pieces/white queen.svg",
    [FENChar.WhiteRook]:"assets/pieces/white rook.svg",
}

export type SafeSqures = Map<string, Coodrs[]>;

export type LastMove = {
    piece : Piece,
    prevX : number,
    prevY : number,
    currX : number,
    currY : number
}