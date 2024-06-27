import { Component, OnInit, inject } from '@angular/core';
import { ChessBoardComponent } from '../chess-board/chess-board.component';
import { StockfishService } from './stockfish.service';
import { ChessBoardService } from '../chess-board/chess-board.service';
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-computer-mode',
  standalone: true,
  imports: [],
  templateUrl: '../chess-board/chess-board.component.html',
  styleUrl: '../chess-board/chess-board.component.css'
})
export class ComputerModeComponent extends ChessBoardComponent implements OnInit{
  constructor(private stockfishService:StockfishService){
    super(inject(ChessBoardService));
  }
  public ngOnInit(): void {
      const chessBoardStateSubscription:Subscription=this.chessBoardService.chessBoardState$.subscribe({
        next:async(FEN:string)=>{
          const player:string=FEN.split(" ")[1];
          if(player==="w") return;
          const {prevX,prevY,newX,newY,promotedPiece}= await firstValueFrom(this.stockfishService.getBestMove(FEN));
        }
      })
  }

}
