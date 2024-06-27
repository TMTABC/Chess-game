import { FENConverter } from "./FENConverter";
import { CheckSate, Color, Coodrs, FENChar, LastMove, SafeSqures } from "./models";
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
    private _checkSate : CheckSate = {isInCheck:false};
    private fiftyMoveRuleCounter:number=0;

    private _isGameOver:boolean=false;
    private _gameOverMessage:string|undefined;
    private fullNumberOfMoves:number=1;
    private threeFoldRepetitionDictionary=new Map<string,number>();
    private threeFoldRepetitionFlag:boolean=false;
    private _boardAsFEN:string="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    private FENConverter = new FENConverter();

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

    public get checkSate():CheckSate{
        return this._checkSate
    }

    public isGameOver():boolean{
        return this._isGameOver;
    }

    public get gameOverMessage():string|undefined{
        return this._gameOverMessage;
    }

    public get boardAsFEN():string{
        return this._boardAsFEN;
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
                        if(attackedPiece instanceof King && attackedPiece.color === playerColor){
                            if(checkingCurrentPosition) this._checkSate = {isInCheck:true,x:newX,y:newY}
                            return true;
                        } 
                    
                    }else {
                        while(this.areCoodrsValid(newX,newY)){

                            const attackedPiece : Piece|null = this.chessBoard[newX][newY];
                            if(attackedPiece instanceof King && attackedPiece.color === playerColor){
                                if(checkingCurrentPosition) this._checkSate = {isInCheck:true,x:newX,y:newY}
                                return true;
                            }
                            if(attackedPiece !== null) break;
                            
                            newX += dx;
                            newY += dy;
                        }
                    }
                }
            }
        }
        if(checkingCurrentPosition) this._checkSate={isInCheck:false}
        return false
    }
    private isPositionSafeAfterMove(prevX:number,prevY:number,newX:number,newY:number):boolean{
        const piece:Piece|null=this.chessBoard[prevX][prevY];
        if(!piece) return false;
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
                        if(this.isPositionSafeAfterMove(i,j,newX,newY)){
                            pieceSafeSqures.push({x:newX,y:newY})
                        }
                    }else {
                        while(this.areCoodrsValid(newX,newY)){
                            newPiece = this.chessBoard[newX][newY];
                            if(newPiece && newPiece.color === piece.color) break;

                            if(this.isPositionSafeAfterMove(i,j,newX,newY)){
                                pieceSafeSqures.push({x:newX,y:newY})
                            }
                            if(newPiece !== null) break;

                            newX+=dx;
                            newY+=dy;
                        }
                    }
                }
                if(piece instanceof King){
                    if(this.canCastle(piece,true)){
                        pieceSafeSqures.push({x:i,y:6});
                    }
                    if(this.canCastle(piece,false)){
                        pieceSafeSqures.push({x:i,y:2});
                    }
                }else if(piece instanceof Pawn && this.canCaptureEnPassant(piece,i,j)){
                    pieceSafeSqures.push({x:i+(piece.color===Color.White?1:-1),y:this._lastMove!.prevY})
                }

                if(pieceSafeSqures.length){
                    safeSqures.set(i+","+j,pieceSafeSqures);
                }
            }
        }
        
        return safeSqures;
    }

    private canCaptureEnPassant(pawn:Pawn,pawnX:number,pawnY:number):boolean{
        if(!this._lastMove) return false;
        const {piece,prevX,prevY,currX,currY} = this._lastMove;
        if(
            !(piece instanceof Pawn)||
            pawn.color!==this._playerColor||
            Math.abs(currX-prevX)!==2||
            pawnX !== currX||
            Math.abs(pawnY-currY)!==1
        )return false;

        const pawnNewPositionX:number = pawnX+(pawn.color===Color.White?1:-1);
        const pawnNewPositionY:number = currY;
        this.chessBoard[currX][currY]=null;
        const isPositionSafe:boolean = this.isPositionSafeAfterMove(pawnX,pawnY,pawnNewPositionX,pawnNewPositionY);
        this.chessBoard[currX][currY]=piece;
        return isPositionSafe
    }

    private canCastle(king:King,kingSideCastle:boolean):boolean{
        if(king.hasMoved) return false;
        const kingPositionX:number = king.color === Color.White ? 0:7;
        const kingPositionY:number = 4;
        const rookPositionX:number = kingPositionX;
        const rookPositionY:number = kingSideCastle ? 7:0;
        const rook:Piece|null = this.chessBoard[rookPositionX][rookPositionY];
        if(!(rook instanceof Rook) || rook.hasMoved || this.checkSate.isInCheck) return false;

        const firstNextKingPositionY:number=kingPositionY+(kingSideCastle?1:-1);
        const secondNextKingPositionY:number=kingPositionY+(kingSideCastle?2:-2);

        if(this.chessBoard[kingPositionX][firstNextKingPositionY]||this.chessBoard[kingPositionX][secondNextKingPositionY])return false;

        if(!kingSideCastle && this.chessBoard[kingPositionX][1])return false;
        
        return this.isPositionSafeAfterMove(kingPositionX,kingPositionY,kingPositionX,firstNextKingPositionY)&&
        this.isPositionSafeAfterMove(kingPositionX,kingPositionY,kingPositionX,secondNextKingPositionY) 
    }

    public move(prevX:number,prevY:number,newX:number,newY:number,promotedPieceType:FENChar|null):void{
        if(this._isGameOver) throw Error("Game is over,you can play move");
        if(!this.areCoodrsValid(prevX,prevY)||!this.areCoodrsValid(newX,newY)) return;
        const piece : Piece|null = this.chessBoard[prevX][prevY];
        if(!piece||piece.color!==this._playerColor) return;
        const pieceSafeSquare : Coodrs[]|undefined= this._safeSquare.get(prevX+","+prevY);
        if(!pieceSafeSquare || !pieceSafeSquare.find(coodrs=>coodrs.x===newX&&coodrs.y===newY))
            throw new Error("Square is not safe");
        if((piece instanceof Pawn || piece instanceof King || piece instanceof Rook)&&!piece.hasMoved){
            piece.hasMoved=true;
        }
        const isPieceTaken:boolean=this.chessBoard[newX][newY]!== null;
        if(piece instanceof Pawn|| isPieceTaken) this.fiftyMoveRuleCounter=0;
        else this.fiftyMoveRuleCounter+=0.5;
        this.handlingSpecialMoves(piece,prevX,prevY,newX,newY);
        //update the chess
        console.log(pieceSafeSquare);
        if(promotedPieceType){
            this.chessBoard[newX][newY]=this.promotedPiece(promotedPieceType);
        }else{
            this.chessBoard[newX][newY]=piece;
        }
        
        this.chessBoard[prevX][prevY]=null;
        
        this._lastMove={prevX,prevY,currX:newX,currY:newY,piece};
        this._playerColor = this._playerColor === Color.White ? Color.Black:Color.White;
        this.isInCheck(this._playerColor,true);
        this._safeSquare = this.findSafeSqures();
        this._isGameOver=this.isGameFinshed();
        if(this._playerColor === Color.White) this.fullNumberOfMoves++;
        this._boardAsFEN=this.FENConverter.converterBoardToFEN(this.chessBoard,this._playerColor,this._lastMove,this.fiftyMoveRuleCounter,this.fullNumberOfMoves);
        this.updateThreeFoldRepetitionDictionary(this._boardAsFEN)
    }

    private handlingSpecialMoves(piece:Piece,prevX:number,prevY:number,newX:number,newY:number):void{
        if(piece instanceof King && Math.abs(newY-prevY)===2){
            // newY > prevY king side castle
            const rookPositionX:number =prevX;
            const rookPositionY:number =newY>prevY? 7:0;
            const rook = this.chessBoard[rookPositionX][rookPositionY] as Rook;
            const rookNewPosition:number =newY > prevY ? 5:3;
            this.chessBoard[rookPositionX][rookPositionY] =null;
            this.chessBoard[rookPositionX][rookNewPosition] =rook;
            rook.hasMoved=true;
        }
        else if(
            piece instanceof Pawn &&
            this._lastMove &&
            this._lastMove.piece instanceof Pawn &&
            Math.abs(this._lastMove.currX - this._lastMove.prevX)===2 &&
            prevX === this._lastMove.currX &&
            newY === this._lastMove.currY
        ){
            this.chessBoard[this._lastMove.currX][this._lastMove.currY]=null;
        }
    }
    private promotedPiece(promotedPieceType:FENChar):Knight|Bishop|Rook|Queen{
        if(promotedPieceType === FENChar.BlackBishop || promotedPieceType === FENChar.WhiteBishop){
            return new Bishop(this._playerColor);
        }
        if(promotedPieceType === FENChar.BlackKnight || promotedPieceType === FENChar.WhiteKnight){
            return new Knight(this._playerColor);
        }
        if(promotedPieceType === FENChar.BlackRook || promotedPieceType === FENChar.WhiteRook){
            return new Rook(this._playerColor);
        }  
        return new Queen(this._playerColor);
    }

    private isGameFinshed():boolean{
        if(this.insufficientMaterial()){
            this._gameOverMessage="Dawn due insufficient material position";
            return true;
        }
        if(!this.safeSquares.size){
            if(this._checkSate.isInCheck){
                const prevPlayer:string=this._playerColor===Color.White?"Black":"White";
                this._gameOverMessage=prevPlayer+" won by checkmate";
            }
            else this._gameOverMessage = "Stalemate"
            return true;
        }
        if(this.threeFoldRepetitionFlag){
            this._gameOverMessage="Draw due three fold repetition rule";
            return true;
        }
        if(this.fiftyMoveRuleCounter===50){
            this._gameOverMessage="Draw due fifty move rule";
            return true;
        }
        return false;
    }

    private playerHasOnlyTwoKnightAndKing(piece:{piece:Piece,x:number,y:number}[]):boolean{
        return piece.filter(piece=>piece.piece instanceof Knight).length===2;
    }
    private playerHasOnlyBishopWithSameColorAndKing(piece:{piece:Piece,x:number,y:number}[]):boolean{
        const bishops=piece.filter(piece=>piece.piece instanceof Bishop);
        const areAllBishopOfSameColor= new Set(bishops.map(bishop=>ChessBoard.isSquareDark(bishop.x,bishop.y))).size===1;
        return bishops.length===piece.length-1&& areAllBishopOfSameColor;
    }

    //insufficient material
    private insufficientMaterial():boolean{
        const whitePiece:{piece:Piece,x:number,y:number}[]=[];
        const blackPiece:{piece:Piece,x:number,y:number}[]=[];

        for(let i=0;i<this.chessBoardSize;i++){
            for(let j=0;j<this.chessBoardSize;j++){
                const piece:Piece|null=this.chessBoard[i][j];
                if(!piece) continue;
                if(piece.color===Color.White) whitePiece.push({piece,x:i,y:j});
                else blackPiece.push({piece,x:i,y:j});
            }
        }
        //King vs King
        if(whitePiece.length===1&&blackPiece.length===1)
            return true;
        //King and Minor Piece vs King
        if(whitePiece.length === 1 && blackPiece.length ===2)
            return blackPiece.some(piece=>piece.piece instanceof Knight||piece.piece instanceof Bishop);
        else if(whitePiece.length === 2 && blackPiece.length ===1)
            return blackPiece.some(piece=>piece.piece instanceof Knight||piece.piece instanceof Bishop);
        //both sides have bishop of same color 
        else if(whitePiece.length===2&&blackPiece.length===2){
            const whiteBishop=whitePiece.find(piece=>piece.piece instanceof Bishop);
            const blackBishop=blackPiece.find(piece=>piece.piece instanceof Bishop);

            if(whiteBishop && blackBishop){
                const areBishopsOfSameColor:boolean=ChessBoard.isSquareDark(whiteBishop.x,whiteBishop.y)&&ChessBoard.isSquareDark(blackBishop.x,blackBishop.y)||
                    !ChessBoard.isSquareDark(whiteBishop.x,whiteBishop.y)&&!ChessBoard.isSquareDark(blackBishop.x,blackBishop.y);
                return areBishopsOfSameColor;
            }
        }
        if( whitePiece.length===3 && blackPiece.length===1 && this.playerHasOnlyTwoKnightAndKing(whitePiece)||
            whitePiece.length===1 && blackPiece.length===3 && this.playerHasOnlyTwoKnightAndKing(blackPiece))
            return true;
        
        if( whitePiece.length>=3 && blackPiece.length===1 && this.playerHasOnlyBishopWithSameColorAndKing(whitePiece)||
            whitePiece.length===1 && blackPiece.length>=3 && this.playerHasOnlyBishopWithSameColorAndKing(blackPiece))
            return true;

        return false;
    }
    private updateThreeFoldRepetitionDictionary(FEN:string):void{
        const threeFoldRepetitionFENKey:string=FEN.split(" ").slice(0,4).join("");
        const threeFoldRepetitionValue:number|undefined=this.threeFoldRepetitionDictionary.get(threeFoldRepetitionFENKey);

        if(threeFoldRepetitionValue===undefined){
            this.threeFoldRepetitionDictionary.set(threeFoldRepetitionFENKey,1);
        }else{
            if(threeFoldRepetitionValue===2){
                this.threeFoldRepetitionFlag=true;
                return;
            }
            this.threeFoldRepetitionDictionary.set(threeFoldRepetitionFENKey,2);
        } 
    }
}