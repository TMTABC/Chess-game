import { columns } from "../modules/chess-board/models";
import { Color, LastMove } from "./models";
import { King } from "./pieces/king";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./pieces/piece";
import { Rook } from "./pieces/rook";

export class FENConverter{
    public static readonly initalPosition: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    public converterBoardToFEN(
        board:(Piece|null)[][],
        playerColor:Color,
        lastMove:LastMove|undefined,
        fiftyMoveRuleCounter:number,
        numberOfFullMoves:number,
    ):string{
        let FEN :string="";
        for(let i=7;i>=0;i--){
            let FENRow:string ="";
            let consencutiveEmptySquareCounter=0;
            for(const piece of board[i]){
                if(!piece){
                    consencutiveEmptySquareCounter++;
                    continue;
                }
                if(consencutiveEmptySquareCounter!==0){
                    FENRow+=String(consencutiveEmptySquareCounter);
                }
                consencutiveEmptySquareCounter=0;
                FENRow+=piece.FENChar;
            }
            if(consencutiveEmptySquareCounter!==0){
                FENRow+=String(consencutiveEmptySquareCounter);
            }
            FEN+=(i==0)?FENRow:FENRow+"/";
        }
        const player:string=playerColor===Color.White?"w":'b';
        FEN+=" " +player;
        FEN+=" " +this.castlingAvailability(board);
        FEN+=" " +this.enPassantPosibility(lastMove,playerColor);
        FEN+=" " +fiftyMoveRuleCounter*2;
        FEN+=" " +numberOfFullMoves;
        return FEN;
    }
    private castlingAvailability(board:(Piece|null)[][]):string{
        const castlingPossiblities=(color:Color):string=>{
            let castlingAvailability:string="";
            let kingPositionX:number=color===Color.White?0:7;
            let king:Piece|null=board[kingPositionX][4];
            if(king instanceof King && !king.hasMoved){
                const rookPositionX:number=kingPositionX;
                const kingSideRook = board[rookPositionX][7];
                const queenSideRook = board[rookPositionX][0];
                if(kingSideRook instanceof Rook && !kingSideRook .hasMoved){
                    castlingAvailability+="k";
                }
                if(queenSideRook instanceof Rook && !queenSideRook .hasMoved){
                    castlingAvailability+="q";
                }
                if(color===Color.White) castlingAvailability=castlingAvailability.toUpperCase();
            }
            return castlingAvailability;
        }
        const castlingAvailablity:string=castlingPossiblities(Color.White)+castlingPossiblities(Color.Black);
        return castlingAvailablity!==""? castlingAvailablity:"-";
    }
    private enPassantPosibility(lastMove:LastMove|undefined,color:Color):string{
        if(!lastMove) return "-";
        const {piece,currX:newX,prevX,prevY}=lastMove;
        if(piece instanceof Pawn && Math.abs(newX-prevX)===2){
            const row:number= color === Color.White ? 6:3;
            return columns[prevY]+String(row);
        }
        return "-";
    }
}