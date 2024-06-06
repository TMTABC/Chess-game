import {
  Coodrs,
  pieceImagePaths,
  SafeSqures,
} from './../../chess-logic/models';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Color, FENChar } from '../../chess-logic/models';
import { ChessBoard } from './../../chess-logic/chess-board';
import { Component } from '@angular/core';
import { SelectionSquare } from './models';
import { Piece } from '../../chess-logic/pieces/piece';

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.css',
})
export class ChessBoardComponent {
  public pieceImagePaths = pieceImagePaths;

  protected chessBoard = new ChessBoard();
  public chessBoardView: (FENChar | null)[][] = this.chessBoard.chessBoardView;
  public get playerColor(): Color {
    return this.chessBoard.playerColor;
  }
  public get safeSqures(): SafeSqures {
    return this.chessBoard.safeSquares;
  }
  private selectedSquare: SelectionSquare = { piece: null };
  private pieceSafeSquare: Coodrs[] = [];

  public isSquareDark(x: number, y: number): boolean {
    return ChessBoard.isSquareDark(x, y);
  }

  public isSquareSelected(x: number, y: number): boolean {
    if (!this.selectedSquare.piece) return false;
    return this.selectedSquare.x === x && this.selectedSquare.y === y;
  }

  public isSquareSafeForSeletedPiece(x: number, y: number): boolean {
    const a= this.pieceSafeSquare.some(
      (coodrs) => coodrs.x === x && coodrs.y === y
    );
    return a;
  }

  public selectingPiece(x: number, y: number): void {
    const piece: FENChar | null = this.chessBoardView[x][y];
    if (!piece) return;
    if (this.isWrongPieceSelected(piece)) return;
    this.selectedSquare = { piece, x, y };
    this.pieceSafeSquare = this.safeSqures.get(x + "," + y) || [];
    
  }

  private placingPiece(newX:number,newY:number):void{
    if(!this.selectedSquare.piece) return;
    if(!this.isSquareSafeForSeletedPiece(newX,newY)) return;
    const {x:prevX,y:prevY} = this.selectedSquare;
    
    this.chessBoard.move(prevX,prevY,newX,newY);
    this.chessBoardView= this.chessBoard.chessBoardView;
  }
  
  public move(x:number,y:number):void{
    this.selectingPiece(x,y);
    this.placingPiece(x,y);
    console.log(this.chessBoardView[x][y]);
  }

  private isWrongPieceSelected(piece: FENChar): boolean {
    const isWhitePieceSelected: boolean = piece === piece.toUpperCase();
    return (
      (isWhitePieceSelected && this.playerColor === Color.Black) ||
      (!isWhitePieceSelected && this.playerColor === Color.White)
    );
  }
}
