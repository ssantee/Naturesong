import { Component, ViewChild } from '@angular/core';
import { Content, NavParams } from 'ionic-angular';
//import { Globalization } from '@ionic-native';

import { Track } from '../../app/track';

import { TracksService } from '../../app/tracks.service';
import { PlayerService } from '../../app/player.service';

import { FavoritesService } from '../../app/favorites.service';

import { TimerControlsService } from '../../app/timercontrols.service';

@Component( {
    selector: 'page-favorites',
    templateUrl: 'favorites.html'
    //providers: [Globalization]
} )

export class FavoritesPage {
    @ViewChild(Content) content: Content;

    favoritesList: Array<Track>;

    selectedItem: any;
    tracks: Array<Track>;
    loadedId: string;
    
    playingTrack: Track;
    playing: boolean = true;
    nowPlaying: String;
    pausePlay: String = 'play';

    timerActive: boolean = false;

    constructor( navParams: NavParams, private favoritesService: FavoritesService, private tracksService: TracksService, private playerService: PlayerService, private timerControlsService: TimerControlsService ){

        this.selectedItem = navParams.get('item');

        this.timerActive = this.playerService.getPlayer().timerIsActive;

        this.playerService.getPlayer().timerStarted.subscribe( ()=>{
            
            this.timerActive = true;
        }, ()=>{}, ()=>{} );
        this.playerService.getPlayer().timerStopped.subscribe( ()=>{
            
            this.timerActive = false;
        }, ()=>{}, ()=>{} );
    }

    getTracks( query ): Array<Track> {

        return this.tracks = this.tracksService.queryToTracks(query);
    }

    itemTapped(event, item) {
        console.log('item tapped: ' + item.name);

        var track: Track = this.tracksService.getTrackById(item.id);
        
        this.playerService.play( track );

        this.ionViewWillEnter();
    }

    ionViewWillEnter(){
        
        this.playingTrack = this.playerService.getNowPlayingTrack();
        this.playing = this.playerService.isPlaying() || this.playerService.isPaused();
        this.nowPlaying = this.playerService.getNowPlayingTitle();
        this.pausePlay = this.playerService.isPlaying() ? 'pause' : 'play';
        this.content.resize();

        this.favoritesService.getFavoritesAsync().then( ( result )=>{
            var query = result;
            
            if( query !== null && query !== undefined ){

                this.favoritesList = this.getTracks( query );
            }
        } );
    }

    addFavorite(){
    
        this.favoritesService.handleFavoriteAction().then( ( result1 )=>{

            this.favoritesService.favoritesDecisions( result1 ).then( ( result2 )=>{

                this.favoritesList = result2;         
                //console.log(result2);       
            } );
        } )
    }

    miniPlayerPause(){
        //this looks odd but the play method does the heavy lifting
        //on figuring what's playing and what should happen
        //when this control is clicked
        this.playerService.play();
        this.pausePlay = this.playerService.isPlaying() ? 'pause' : 'play';
    }

    openTimerControls( $event ){

        this.timerControlsService.presentActionSheet();
    }
}
