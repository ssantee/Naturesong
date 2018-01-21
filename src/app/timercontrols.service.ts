import { Injectable } from '@angular/core';
import { ActionSheetController } from 'ionic-angular';

import { PlayerService } from './player.service';

@Injectable()
export class TimerControlsService {

    constructor( private playerService: PlayerService, private actionSheetCtrl: ActionSheetController ){}

    presentActionSheet() {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Set Timer',
            buttons: [
                {
                    text: '5 Minutes',
                    handler: () => {
                        //console.log('Timer set for 5 minutes');
                        this.playerService.setTimer( 5 );
                    }
                },
                {
                    text: '15 Minutes',
                    handler: () => {
                        //console.log('Timer set for 15 minutes');
                        this.playerService.setTimer( 15 );
                    }
                },
                {
                    text: '30 Minutes',
                    handler: () => {
                        //console.log('Timer set for 30 minutes');
                        this.playerService.setTimer( 30 );
                    }
                }, 
                {
                    text: '1 Hour',
                    handler: () => {
                        //console.log('Timer set for 1 hour');
                        this.playerService.setTimer( 60 );
                    }
                }, 
                {
                    text: '2 Hours',
                    handler: () => {
                        //console.log('Timer set for 2 hours');
                        this.playerService.setTimer( 120 );
                    }
                }, 
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }

}