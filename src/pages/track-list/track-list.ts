import { Component, ViewChild } from '@angular/core';
import { Content, NavController, NavParams } from 'ionic-angular';

import { Track } from '../../app/track';
import { TracksService } from '../../app/tracks.service';

import { PlayerService } from '../../app/player.service';

import { FavoritesService } from '../../app/favorites.service';

import { TimerControlsService } from '../../app/timercontrols.service';

@Component({
    selector: 'page-track-list',
    templateUrl: 'track-list.html'
})
export class TrackListPage {
    @ViewChild(Content) content: Content;

    selectedItem: any;
    tracks: Array<Track>;
    loadedId: string;
    
    playingTrack: Track;
    playing: boolean = true;
    nowPlaying: String;
    pausePlay: String = 'play';

    timerActive: boolean = false;

    constructor(private playerService: PlayerService, private tracksService: TracksService, public navCtrl: NavController, public navParams: NavParams, protected favoritesService: FavoritesService, private timerControlsService: TimerControlsService) {
        // If we navigated to this page, we will have an item available as a nav param
        this.selectedItem = navParams.get('item');

        if( this.selectedItem !== undefined ){

            this.getTracks( this.selectedItem.name );
        }

        this.loadedId = '';

        this.timerActive = this.playerService.getPlayer().timerIsActive;

        this.playerService.getPlayer().timerStarted.subscribe( ()=>{
            
            this.timerActive = true;
        }, ()=>{}, ()=>{} );
        this.playerService.getPlayer().timerStopped.subscribe( ()=>{
            
            this.timerActive = false;
        }, ()=>{}, ()=>{} );        
    }

    getTracks(filter): void {

        this.tracksService.getTracks(filter).then(tracks => this.tracks = tracks);
    }

    itemTapped(event, item) {
        console.log('item tapped: ' + item.name);

        var track: Track = this.tracksService.getTrackById(item.id);
        
        this.playerService.play( track ).then( ()=>{;

            this.ionViewWillEnter();

        }, ()=>{} );
    }

    ionViewWillEnter(){

        this.playingTrack = this.playerService.getNowPlayingTrack();

        this.playing = this.playerService.isPlaying() || this.playerService.isPaused();

        this.nowPlaying = this.playerService.getNowPlayingTitle();

        this.pausePlay = this.playerService.isPlaying() ? 'pause' : 'play';

        this.content.resize();
    }

    addFavorite(){
    
        this.favoritesService.handleFavoriteAction().then( ( result1 )=>{

            this.favoritesService.favoritesDecisions( result1 ).then( ( result2 )=>{

                //this.favoritesList = result2;                
            } );
        } )
    }

    miniPlayerPause(){
        //this looks odd but the play method does the heavy lifting
        //on figuring what's playing and what should happen
        //when this control is clicked

        this.playingTrack = this.playerService.getNowPlayingTrack();

        this.itemTapped( {}, this.playingTrack );
        
    }

    openTimerControls( $event ){

        this.timerControlsService.presentActionSheet();
    }
}
