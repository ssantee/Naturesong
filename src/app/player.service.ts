import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Track } from './track';
import { TracksService } from './tracks.service';
import { MediaPlayer } from './mediaPlayer-native';
//import { MediaPlayer } from './mediaPlayer-legacy';

@Injectable()
export class PlayerService {

    //private onePlayer: MediaPlayer;
    nowPlaying: Track
    
    isAndroid;
    //for ios, check android and set that version
    //in constructor
    assetPath: String = '/assets/audio/';

    states = {
        playing: 'playing',
        paused: 'paused',
        stopped: 'stopped'
    };

    playingState: String = this.states.stopped;

    constructor( private tracksService:TracksService, private platForm: Platform, private onePlayer: MediaPlayer ){

        //this.onePlayer = new MediaPlayer();

        this.setupAssetPath();
    }

    getPlayer( ): MediaPlayer {

        return this.onePlayer;
    }

    setupAssetPath(){

        this.isAndroid = this.platForm.is( 'android' );

        //console.log( 'isAndroid ' + this.isAndroid );
        
        if( this.isAndroid ){

            this.assetPath = '/android_asset/www/assets/audio/';
            console.log( 'using android asset path: ' + this.assetPath );
        }
    }

    play( track?: Track ){

        return new Promise( ( resolve, reject )=>{
            
            var nowPlaying = this.getNowPlaying();

            if( track === nowPlaying && this.isPlaying() ){

                //currently playing, so a pause indicator was tapped

                this.pause();
                this.setPlayingState( this.states.paused );
                track.playing = false;

                resolve();
            }
            else if( track === nowPlaying && !this.isPlaying() ){

                //not currently playing, play indicator tapped
                //resume

                this.onePlayer.setupFile( this.assetPath + track.fileName, track ).then( ()=>{

                    this.setNowPlaying( track );

                    this.setPlayingState( this.states.playing );
                
                    track.playing = true;

                    resolve();

                }, ()=>{} );
            }
            else if( track !== undefined && track !== nowPlaying && this.isPlaying() ){
                
                //another track was playing, play control tapped on a track that is not
                //the current playing track
                this.onePlayer.stop().then( ()=>{
                    
                    this.onePlayer.setupFile( this.assetPath + track.fileName, track ).then( ()=>{

                        this.setNowPlaying( track );

                        this.setPlayingState( this.states.playing );
                    
                        track.playing = true;

                        resolve();

                    }, ()=>{} );
                } );
                
            }
            else if( track === undefined ){

                //called from mini-player controls
                if( this.getPlayingState() === this.states.stopped ){

                    this.onePlayer.setupFile( this.assetPath + this.nowPlaying.fileName, track );
                    //this.onePlayer.setupFile( this.assetPath + this.nowPlaying.fileName );
                    
                    this.setNowPlaying( track );
                    
                    this.onePlayer.play( );
                    
                    this.setPlayingState( this.states.playing );
                    
                    nowPlaying.playing = true;

                    this.onePlayer.stopNotification.subscribe( ()=>{

                        //in the case that the player stops iself,
                        //funnel that back to the view
                        this.getNowPlaying().playing = false;
                    }, ()=>{

                        console.log( 'stopNotification fired 2' );
                    }, ()=>{

                        console.log( 'stopNotification 3' );
                    } );

                    resolve();
                }
                else{

                    this.onePlayer.stop().then( ()=>{

                        this.setPlayingState( this.states.stopped );
                        nowPlaying.playing = false;

                        resolve();
                    } );
                }
            }
            else{

                this.onePlayer.setupFile( this.assetPath + track.fileName, track ).then( ()=>{

                    this.setNowPlaying( track );

                    this.setPlayingState( this.states.playing );

                    track.playing = true;

                    this.onePlayer.stopNotification.subscribe( ()=>{

                        //in the case that the player stops iself,
                        //funnel that back to the view
                        track.playing = false;
    
                        this.setPlayingState( this.states.stopped );
                    }, ()=>{
    
                        console.log( 'stopNotification fired 2' );
                    }, ()=>{
                        console.log( 'stopNotification 3' );
    
                    } );

                    resolve();

                }, ()=>{} );
            }
        } );
    }

    setNowPlaying( track ){

        //any previously playing track should be set to not playing
        this.nowPlaying ? this.nowPlaying.playing = false : '';

        this.nowPlaying = track;
    }

    getNowPlaying(): Track {

        return this.nowPlaying;
    }

    isPlaying() : boolean{

        return this.getPlayingState() === this.states.stopped || this.getPlayingState() === this.states.paused ? false: true;
    }

    isPaused(): boolean{

        return this.getPlayingState() === this.states.paused;
    }

    getPlayingState() : string{

        var state = 'stopped';

        if( this.onePlayer.isPlaying ){

            state = this.states.playing;
        }
        else if( this.onePlayer.isPaused ){

            state = this.states.paused;
        }
        else{

            state = this.states.stopped;
        }

        return state;
    }

    setPlayingState( state ){

        this.playingState = state;
    }

    getNowPlayingTrack(): Track{

        return this.nowPlaying;
    }

    getNowPlayingTitle(): String {

        return this.nowPlaying ? this.nowPlaying.name : '' ;
    }

    pause(){
        
        this.onePlayer.pause( );
        this.setPlayingState( this.states.paused );
    }

    stop(){

        this.onePlayer.stop();
        this.playingState = this.states.stopped;
        this.getNowPlayingTrack().playing = false;
    }

    setTimer( time ){
        if( this.getPlayingState() === this.states.playing ){

            this.onePlayer.setPlayForTimer( time );
        }
    }
}
