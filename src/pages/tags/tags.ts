import { Component, ViewChild } from '@angular/core';
import { Content, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Track } from '../../app/track';
import { TracksService } from '../../app/tracks.service';
import { PlayerService } from '../../app/player.service';
import { FavoritesService } from '../../app/favorites.service';
import { TimerControlsService } from '../../app/timercontrols.service';

//import { Globalization } from '@ionic-native';

@Component({
  selector: 'page-tags',
  templateUrl: 'tags.html'
})

export class TagsPage {
    @ViewChild(Content) content: Content;

    tags;
    selectedTags;
    selectOptions = { title: 'Select Tags' };//options passed to the alert ctrl from the select element
    tracks: Array<Track> = [];
    totalTracks: number;
    playingTrack: Track;
    playing: boolean = true;
    nowPlaying: String;
    pausePlay: String = 'play';
    timerActive: boolean = false;

    constructor( public loadingCtrl: LoadingController, private tracksService: TracksService, public navCtrl: NavController, public navParams: NavParams, public playerService: PlayerService, private favoritesService: FavoritesService, private timerControlsService: TimerControlsService ) {

        this.totalTracks = this.tracksService.getNumberOfTracks();

        this.playerService.getPlayer().timerStarted.subscribe( ()=>{
            
            this.timerActive = true;
        }, ()=>{}, ()=>{} );
        this.playerService.getPlayer().timerStopped.subscribe( ()=>{
            
            this.timerActive = false;
        }, ()=>{}, ()=>{} );

        this.tags = tracksService.getAllTags();
        this.tags.sort();
    }

    updateSelected( event ){
      var loader = this.loadingCtrl.create();
      
      loader.present();

      this.tracks = [];

      console.log(this.selectedTags);

      this.tracksService.getTracksByTag( this.selectedTags ).then( ( tracks )=>{

        this.tracks = tracks;
        
        loader.dismiss();
      } );
    }

    itemTapped( event, item ) {
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

