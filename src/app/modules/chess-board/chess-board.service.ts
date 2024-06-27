import { FENConverter } from './../../chess-logic/FENConverter';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChessBoardService {
  public chessBoardState$ = new BehaviorSubject<string>(FENConverter.initalPosition);
}