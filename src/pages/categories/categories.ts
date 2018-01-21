import { Component, ViewChild } from '@angular/core';
import { Content, NavController, NavParams } from 'ionic-angular';
import { TrackListPage } from '../track-list/track-list';
import { Track } from '../../app/track';
import { Categories } from '../../app/categories';
import { CategoriesService } from '../../app/categories.service';

import { TracksService } from '../../app/tracks.service';
//import { Globalization } from '@ionic-native';
import { PlayerService } from '../../app/player.service';
import { FavoritesService } from '../../app/favorites.service';

import { TimerControlsService } from '../../app/timercontrols.service';

@Component( {
    selector: 'page-categories',
    templateUrl: 'categories.html'
    //providers: [Globalization]
} )

export class CategoriesPage {
    @ViewChild(Content) content: Content;

    categories: Array<Categories>;
    totalTracks: number;
    playingTrack: Track;
    playing: boolean = true;
    nowPlaying: String;
    pausePlay: String = 'play';
    timerActive: boolean = false;

    constructor( private tracksService: TracksService, private categoriesService: CategoriesService, public navCtrl: NavController, public navParams: NavParams, public playerService: PlayerService, private favoritesService: FavoritesService, private timerControlsService: TimerControlsService ) {

        this.totalTracks = this.tracksService.getNumberOfTracks();

        this.getCategories();

        this.timerActive = this.playerService.getPlayer().timerIsActive;

        this.playerService.getPlayer().timerStarted.subscribe( ()=>{
            
            this.timerActive = true;
        }, ()=>{}, ()=>{} );
        this.playerService.getPlayer().timerStopped.subscribe( ()=>{
            
            this.timerActive = false;
        }, ()=>{}, ()=>{} );
    }

    getCategories(): void {

        this.categoriesService.getCategories().then( categories => this.categories = categories );
    }

    itemTapped( event, item ) {
        
        if( !this.content.isScrolling ){
            this.navCtrl.push( TrackListPage, {
                item: item
            } );
        }
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
        this.playerService.play();
        this.pausePlay = this.playerService.isPlaying() ? 'pause' : 'play';
    }

    openTimerControls( $event ){

        this.timerControlsService.presentActionSheet();
    }
}
