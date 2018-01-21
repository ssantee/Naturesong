import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Track } from './track';
import { TracksService } from './tracks.service';

import { MediaPlayer } from './mediaPlayer';

@Injectable()
export class PlayerService {

    private onePlayer: MediaPlayer;
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

    constructor( private tracksService:TracksService, private platForm: Platform ){

        this.onePlayer = new MediaPlayer();
    }

    getPlayer( ): MediaPlayer {

        return this.onePlayer;
    }

    play( track?: Track ){

        this.isAndroid = this.platForm.is( 'android' );
        console.log('isAndroid ' + this.isAndroid);
        if( this.isAndroid ){

            this.assetPath = '/android_asset/www/assets/audio/';
            console.log( 'using android asset path: ' + this.assetPath );
        }
        
        var nowPlaying = this.getNowPlaying();

        if( track === nowPlaying && this.isPlaying() ){

            this.pause();
            this.setPlayingState( this.states.paused );
            track.playing = false;
        }
        else if( track === nowPlaying && !this.isPlaying() ){

            //resume
            this.onePlayer.play( );
            this.setPlayingState( this.states.playing );
            track.playing = true;
        }
        else if( track !== undefined && track !== nowPlaying && this.isPlaying() ){
            
            this.onePlayer.stop();
            nowPlaying.playing = false;
            this.onePlayer.setupFile( this.assetPath + track.fileName );
            this.onePlayer.play( track );
            this.setNowPlaying( track );
            this.setPlayingState( this.states.playing );
            track.playing = true;
        }
        else if( track === undefined ){

            //called from mini-player controls
            if( this.getPlayingState() === this.states.stopped ){

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
            }
            else{

                this.onePlayer.stop();
                this.setPlayingState( this.states.stopped );
                nowPlaying.playing = false;
            }
        }
        else{

            this.onePlayer.setupFile( this.assetPath + track.fileName );

            this.onePlayer.play( track );
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
        }

    }

    setNowPlaying( track ){

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
