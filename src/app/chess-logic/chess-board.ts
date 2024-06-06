import { Color, Coodrs, FENChar, LastMove, SafeSqures } from "./models";
import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { Knight } from "./pieces/knight";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./pieces/piece";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";

export class ChessBoard{
    private chessBoard:(Piece|null)[][];
    private readonly chessBoardSize:number = 8;
    private _playerColor = Color.White;
    private _safeSquare : SafeSqures;
    private _lastMove : LastMove|undefined;

    constructor(){
        this.chessBoard = [
            [
                new Rook(Color.White), new Knight(Color.White), new Bishop(Color.White), new Queen(Color.White),
                new King(Color.White), new Bishop(Color.White), new Knight(Color.White), new Rook(Color.White)
            ],
            [
                new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White),
                new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White)
            ],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [
                new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black),
                new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black)
            ],
            [
                new Rook(Color.Black), new Knight(Color.Black), new Bishop(Color.Black), new Queen(Color.Black),
                new King(Color.Black), new Bishop(Color.Black), new Knight(Color.Black), new Rook(Color.Black)
            ],
        ]
        // let pawnRownWhite=[];
        // for(let i=0;i<8;i++){
        //     pawnRownWhite.push(new Pawn(Color.White));
        // }
        // this.chessBoard.push(pawnRownWhite);
        // let space=[null,null,null,null,null,null,null,null];
        // for(let i=0;i<4;i++){
        //     this.chessBoard.push(space);
        // }
        // let pawnRownBlack=[];
        // for(let i=0;i<8;i++){
        //     pawnRownBlack.push(new Pawn(Color.Black));
        // }
        // this.chessBoard.push(pawnRownBlack);
        // let black =  [
        //     new Rook(Color.Black),new Knight(Color.Black),new Bishop(Color.Black),
        //     new Queen(Color.Black),new King(Color.Black),
        //     new Bishop(Color.Black),new Knight(Color.Black),new Rook(Color.Black),
        // ];
        // this.chessBoard.push(black);
        this._safeSquare=this.findSafeSqures();
    }
    public get playerColor():Color{
        return this._playerColor;
    }
    public get chessBoardView(): (FENChar|null)[][]{
        return this.chessBoard.map(row=>{
            return row.map(piece => piece instanceof Piece ? piece.FENChar : null);
        });
    }
    public get safeSquares():SafeSqures{
        return this._safeSquare;
    }

    public get lastMove():LastMove|undefined{
        return this._lastMove;
    }

    public static isSquareDark(x:number,y:number):boolean{
        return x%2===0 && y%2===0 || x%2===1 && y%2===1;
    }

    private areCoodrsValid(x:number,y:number):boolean{
        return x>=0 && y>=0 && 
                x<this.chessBoardSize && 
                y<this.chessBoardSize;
    }
    public isInCheck(playerColor:Color,checkingCurrentPosition:boolean):boolean{
        for(let i=0;i<this.chessBoardSize;i++){
            for(let j=0;j<this.chessBoardSize;j++){
                const piece: Piece|null = this.chessBoard[i][j];
                if(!piece||piece.color===playerColor) continue;

                for(const {x:dx,y:dy} of piece.directions){
                    let newX:number = i + dx;
                    let newY:number = j + dy;
                    
                    if(!this.areCoodrsValid(newX,newY)) continue;

                    if(piece instanceof Pawn || piece instanceof King ||piece instanceof Knight){
                        // pawn only attacking diagonally
                        if(piece instanceof Pawn && dy === 0) continue;
                        const attackedPiece : Piece|null = this.chessBoard[newX][newY];
                        if(attackedPiece instanceof King && attackedPiece.color === playerColor) return true;
                    
                    }else {
                        while(this.areCoodrsValid(newX,newY)){

                            const attackedPiece : Piece|null = this.chessBoard[newX][newY];
                            if(attackedPiece instanceof King && attackedPiece.color === playerColor) return true;
                            if(attackedPiece !== null) break;
                            
                            newX += dx;
                            newY += dy;
                        }
                    }
                }
            }
        }
        return false
    }
    private isPositionSafeAfterMove(piece:Piece,prevX:number,prevY:number,newX:number,newY:number):boolean{
        const newPiece:Piece|null=this.chessBoard[newX][newY];
        if(newPiece&&newPiece.color===piece.color) return false;
        //simulate position
        this.chessBoard[prevX][prevY]=null;
        this.chessBoard[newX][newY]=piece;

        const isPositionSafe:boolean = !this.isInCheck(piece.color,false);
        //restore position back
        this.chessBoard[prevX][prevY]=piece;
        this.chessBoard[newX][newY]=newPiece;

        return isPositionSafe;
    }
    private findSafeSqures():SafeSqures{
        const safeSqures : SafeSqures = new Map<string,Coodrs[]>();
        for(let i=0;i<this.chessBoardSize;i++){
            for(let j=0;j<this.chessBoardSize;j++){
                const piece: Piece|null = this.chessBoard[i][j];
                if(!piece || piece.color !== this._playerColor) continue;
                const pieceSafeSqures : Coodrs[] = [];
                for(const {x:dx,y:dy} of piece.directions){
                    let newX : number = i+dx;
                    let newY : number = j+dy;
                    if(!this.areCoodrsValid(newX,newY)) continue;

                    let newPiece : Piece|null = this.chessBoard[newX][newY];
                    if(newPiece && newPiece.color === piece.color) continue;

                    //need to restrict pawn move certain directions
                    if(piece instanceof Pawn){
                        //cant move pawn two squares straight if there is piece infront of him
                        if(dx===2||dx===-2){
                            if(newPiece) continue;
                            if(this.chessBoard[newX+ (dx===2 ? -1:1)][newY]) continue;
                        }
                        //cant move pawn one squares straight
                        if((dx===1||dx===-1)&&dy===0&&newPiece)continue;
                        //cant move pawn diagonally if there no pied or piece has same color as pawn
                        if((dy===1||dy===-1)&&(!newPiece||piece.color===newPiece.color)) continue;
                    }
                    if(piece instanceof Pawn || piece instanceof King || piece instanceof Knight){
                        if(this.isPositionSafeAfterMove(piece,i,j,newX,newY)){
                            pieceSafeSqures.push({x:newX,y:newY})
                        }
                    }else {
                        while(this.areCoodrsValid(newX,newY)){
                            newPiece = this.chessBoard[newX][newY];
                            if(newPiece && newPiece.color === piece.color) break;

                            if(this.isPositionSafeAfterMove(piece,i,j,newX,newY)){
                                pieceSafeSqures.push({x:newX,y:newY})
                            }
                            if(newPiece !== null) break;

                            newX+=dx;
                            newY+=dy;
                        }
                    }
                }
                if(pieceSafeSqures.length){
                    safeSqures.set(i+","+j,pieceSafeSqures);
                }
            }
        }
        
        return safeSqures;
    }

    public move(prevX:number,prevY:number,newX:number,newY:number):void{
        if(!this.areCoodrsValid(prevX,prevY)||!this.areCoodrsValid(newX,newY)) return;
        const piece : Piece|null = this.chessBoard[prevX][prevY];
        if(!piece||piece.color!==this._playerColor) return;
        const pieceSafeSquare : Coodrs[]|undefined= this._safeSquare.get(prevX+","+prevY);
        if(!pieceSafeSquare || !pieceSafeSquare.find(coodrs=>coodrs.x===newX&&coodrs.y===newY))
            throw new Error("Square is not safe");
        if((piece instanceof Pawn || piece instanceof King || piece instanceof Rook)&&!piece.hasMoved){
            piece.hasMoved=true;
        }
        //update the chess
        console.log(pieceSafeSquare);
        
        this.chessBoard[newX][newY]=piece;
        this.chessBoard[prevX][prevY]=null;
        
        this._lastMove={prevX,prevY,currX:newX,currY:newY,piece};
        this._playerColor = this._playerColor === Color.White ? Color.Black:Color.White;
        this._safeSquare = this.findSafeSqures();
    }
}