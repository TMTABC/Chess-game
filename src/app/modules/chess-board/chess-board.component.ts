import {
  CheckSate,
  Coodrs,
  LastMove,
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
  private selectedSquare: SelectionSquare = { piece: null};
  private pieceSafeSquare: Coodrs[] = [];
  private lastMove: LastMove|undefined = this.chessBoard.lastMove;
  private checkSate:CheckSate = this.chessBoard.checkSate;

  // promotion properties
  public isPromotionActive:boolean=false;
  private promotionCoords:Coodrs|null=null;
  private promotedPiece:FENChar|null=null;
  public promotionPiece():FENChar[]{
    return this.playerColor === Color.Black ?
    [FENChar.BlackBishop,FENChar.BlackKnight,FENChar.BlackQueen,FENChar.BlackRook]:
    [FENChar.WhiteBishop,FENChar.WhiteKnight,FENChar.WhiteQueen,FENChar.WhiteRook];
  }

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

  public isSquarePromotionSquare(x:number,y:number):boolean{
    if(!this.promotionCoords) return false;
    return this.promotionCoords.x===x&&this.promotionCoords.y===y;
  }


  private unmakingPrevouslySelectedAndSafeSquares():void{
    this.selectedSquare = {piece:null};
    this.pieceSafeSquare = [];

    if(this.isPromotionActive){
      this.isPromotionActive=false;
      this.promotedPiece = null;
      this.promotionCoords =null;
    }
  }

  public isSquareLastMove(x:number,y:number): boolean{
    if(!this.lastMove) return false;
    const {prevX,prevY,currX,currY} = this.lastMove;
    return x === prevX && y === prevY || x === currX && y === currY;
  }

  public isSquareChecked(x:number , y:number):boolean{
    return this.checkSate.isInCheck && this.checkSate.x === x && this.checkSate.y === y;
  }

  public selectingPiece(x: number, y: number): void {
    const piece: FENChar | null = this.chessBoardView[x][y];
    if (!piece) return;
    if (this.isWrongPieceSelected(piece)) return;

    const isSameSquareClicked:boolean = !!this.selectedSquare.piece && this.selectedSquare.x === x && this.selectedSquare.y === y;
    this.unmakingPrevouslySelectedAndSafeSquares();
    if(isSameSquareClicked) return;
    this.selectedSquare = { piece, x, y };
    this.pieceSafeSquare = this.safeSqures.get(x + "," + y) || [];
    
  }

  private placingPiece(newX:number,newY:number):void{
    if(!this.selectedSquare.piece) return;
    if(!this.isSquareSafeForSeletedPiece(newX,newY)) return;
    const {x:prevX,y:prevY} = this.selectedSquare;
    
    //pawn promotion
    const isPawnSelected:boolean = this.selectedSquare.piece === FENChar.WhitePawn||this.selectedSquare.piece === FENChar.BlackPawn;
    const isPawnOnlastRank :boolean = isPawnSelected && (newX===7||newX===0);
    const shouldOpenPromotionDialog:boolean = !this.isPromotionActive &&  isPawnOnlastRank;

    if(shouldOpenPromotionDialog){
      this.pieceSafeSquare=[];
      this.isPromotionActive=true;
      this.promotionCoords = {x:newX,y:newY}
      //wait player to choose promoted piece
      return;
    }
    this.updateBoard(prevX,prevY,newX,newY);
  }
  
  private updateBoard(prevX:number,prevY:number,newX:number,newY:number):void{
    this.chessBoard.move(prevX,prevY,newX,newY,this.promotedPiece);
    this.chessBoardView= this.chessBoard.chessBoardView;
    this.checkSate=this.chessBoard.checkSate;
    this.lastMove=this.chessBoard.lastMove;
    this.unmakingPrevouslySelectedAndSafeSquares();
  }

  public promotePiece(piece:FENChar):void{
    if(!this.promotionCoords||!this.selectedSquare.piece) return;
    this.promotedPiece = piece;
    const {x:newX , y:newY} = this.promotionCoords;
    const {x:prevX,y:prevY} = this.selectedSquare;
    this.updateBoard(prevX,prevY,newX,newY);
    
  }

  public closePawnPromotionDialog():void{
    this.unmakingPrevouslySelectedAndSafeSquares()
  }

  public move(x:number,y:number):void{
    this.selectingPiece(x,y);
    this.placingPiece(x,y);
  }

  private isWrongPieceSelected(piece: FENChar): boolean {
    const isWhitePieceSelected: boolean = piece === piece.toUpperCase();
    return (
      (isWhitePieceSelected && this.playerColor === Color.Black) ||
      (!isWhitePieceSelected && this.playerColor === Color.White)
    );
  }
}
