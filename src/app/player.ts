/*import { Track } from './track';

import { NativeAudio } from '@ionic-native/native-audio';

export class Player{
    state: string;
    playing: boolean = false;;
    toPlay: Track;
    currentPlaying: Track;
    volume: number;

    constructor( ){

        this.volume = 1;
        this.state = 'stopped';
    }

    setPlayState( state ){

        this.playing = state;
    }

    getPlayState(): boolean{

        return this.playing;
    }

    getNowPlaying(): String{

        return this.currentPlaying ? this.currentPlaying.name : '';
    }

    setNowPlaying( track ){

        this.currentPlaying = track;
    }

    playSuccess( args ){

        console.log( 'Play Success:' );
        console.log( args );
    }

    playFail( e ){

        console.log( e );
    }

    play( toPlay: Track ){
        this.setPlayState( true );
        this.setNowPlaying( toPlay );
        var $this = this;

        this.toPlay = toPlay;

        console.log( 'Current State: ' + this.state );

        console.log( 'Preloading sound: ' + this.toPlay.name );
        NativeAudio.preloadComplex(this.toPlay.id, '/assets/audio/' + this.toPlay.fileName, 1, 1, 1).then( function(){

            console.log( 'Playing sound: ' + $this.toPlay.name );

            NativeAudio.loop( $this.toPlay.id ).then($this.playSuccess, $this.playFail);

            $this.state = 'playing';
            this.setPlayState(true);
        
        }, function( err ){
            console.log( err );
        } );   
    }

    pause(){

        this.state = 'paused';

        NativeAudio.stop( this.currentPlaying.id );
    }

    stop( track: Track ){

        var $track = track;

        console.log( 'Stopping: ' + track.name );

        NativeAudio.stop( track.id ).then( function(){

            console.log( 'Stopped: ' + $track.name );
        }, function(){});

        NativeAudio.unload( track.id ).then( function(){

            console.log( 'Unloaded: ' + $track.name );
        }, function(){});

        this.state = 'stopped'; 
        this.setPlayState(false);
    }
}
*/