import { EventEmitter, Output, Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
//import { Media, MediaObject } from '@ionic-native/media';
import { NativeAudio } from '@ionic-native/native-audio';

@Injectable()

export class MediaPlayer{
    
    platForm;
    isDesktop;
    isAndroid;

    isPlaying: boolean = false;
    isPaused: boolean = false;
    isStopped: boolean = true;

    positionInterval;
    timer;
    volumeTimer;
    volumeTimer2;
    initVolume = 1;
    volume: number = 1;
    volumeTracker = this.initVolume;
    volumeTracker2 = this.volume;
    //fade out runs the number of times 
    //it takes for initVolume to get 
    //to zero being decremented by 
    //fadeVolumeIncrement
    fadeVolumeIncrement = .05;
    fadeTimeFactor = 75;
    fading = false;

    timerIsActive: boolean = false;
    playStartedAt;
    timerStartedAt;
    playForTimer;
    //if no manual timer is set, how long to play
    //before time out
    defaultPlayForDuration = 60;//minutes
    //how often do we check that play should time out 
    playForDurationIncrement = 10000;//ms

    mediaObj;
    //file: MediaObject;
    //file2: MediaObject;
    filePlaying;
    filePlayingDuration;
    fileAlternateIncrement;

    @Output() stopNotification: EventEmitter<any> = new EventEmitter();
    @Output() timerStarted: EventEmitter<any> = new EventEmitter();
    @Output() timerStopped: EventEmitter<any> = new EventEmitter();

    constructor( 

        private nativeAudio: NativeAudio
     ){

        this.platForm = new Platform();

        //at some point, refactor try/catch in audio
        //methods to use this bool 
        this.isDesktop = this.platForm.is( 'core' );
    }

    onSuccess(){

        console.log( 'preload success' );
    }

    onError(){

        console.log( 'preload error' );
    }

    setupFile( path, track ){
        
        return new Promise( ( resolve, reject )=>{
            
            this.nativeAudio.preloadComplex( 'track1', path, 1, 1, 0 ).then( ()=>{ 
            
                this.play( track ).then( ()=>{

                    resolve();
                }, ()=>{} );             
            }, this.onError );

            this.nativeAudio.preloadComplex( 'track2', path, 1, 1, 0 ).then( this.onSuccess, this.onError );
        });
    }

    releaseFile(){

        // release the native audio resource
        // Platform Quirks:
        // iOS simply create a new instance and the old one will be overwritten
        // Android you must call release() to destroy instances of media when you are done
        //this.file.release();

        //this.file2.release();

        this.nativeAudio.unload('track1').then( ()=>{ console.log( 'track1 release' ) }, ()=>{ console.log( 'track1 release error' ); } );

        this.nativeAudio.unload('track2').then( ()=>{ console.log( 'track2 release' ) }, ()=>{ console.log( 'track2 release error' ); } );
    }

    fadeIn( file ){

        //fade up volume
        this.volumeTimer = setInterval( ()=>{

            if( this.volumeTracker >= 1 ){

                clearInterval( this.volumeTimer );

                this.volumeTracker = this.initVolume;

                console.log( 'fadeIn complete' );
            }
            else{

                this.volumeTracker = this.volumeTracker + this.fadeVolumeIncrement;

                this.nativeAudio.setVolumeForComplexAsset( file , this.volumeTracker ).then( ()=>{}, ()=>{} );

                console.log( 'FadeIn set volume to: ' + parseFloat(this.volumeTracker.toPrecision(2)) );
            }
        }, this.fadeTimeFactor );
    }

    fadeOut( file, stop? ){

        this.fading = true;

        if( stop ){

            clearInterval( this.timer );

            clearInterval( this.volumeTimer );

            clearInterval( this.volumeTimer2 );
            
            clearInterval( this.playForTimer );
        }

        //fade down volume
        var volumeTimer2 = setInterval( ()=>{

            if( parseFloat(this.volumeTracker2.toPrecision(2)) <= 0.1 ){

                clearInterval( volumeTimer2 );

                this.volumeTracker2 = this.volume;

                this.fading = false;

                console.log( 'fadeout complete' );

                if( stop ){

                    this.stop();

                    this.stopNotification.emit();

                    this.timerIsActive = false;

                    this.timerStopped.emit();

                    this.isPlaying = false; 

                    this.isPaused = false;    

                    this.isStopped = true;
                }
            }
            else{

                this.volumeTracker2 = this.volumeTracker2 - this.fadeVolumeIncrement;

                this.nativeAudio.setVolumeForComplexAsset( file , this.volumeTracker2 ).then( ()=>{


                }, ()=>{} );

                console.log( 'FadeOut set volume to: ' + parseFloat(this.volumeTracker2.toPrecision(2)) );
            }
        }, this.fadeTimeFactor );
    };

    setPlayForTimer( customDuration? ){

        if( customDuration === undefined ){
            
            customDuration = this.defaultPlayForDuration;
        }
        else{

            this.timerStarted.emit();

            this.timerIsActive = true;
        }

        //clear any previous timers
        clearInterval( this.playForTimer );

        this.timerStartedAt = Date.now();

        console.log( 'Setting timer for duration: ' +  customDuration + ' minutes.\nStarting at time: ' + this.timerStartedAt );

        //TODO: why doesn't this just settimeout and stop,
        //rather than dealing with calculations at intervals?

        this.playForTimer = setInterval( ()=>{

            var currentTime = Date.now(),
                elapsedTime = currentTime - this.timerStartedAt,
                //minutes to seconds to milliseconds
                timeCap = ( ( customDuration * 60 ) * 1000 ),
                timeToStop = elapsedTime >= timeCap;

            console.log( 'Time to stop?: ' + timeToStop + '. Elapsed Time: ' + elapsedTime + 'ms.' );

            if( timeToStop ){
                
                clearInterval( this.timer );
                
                clearInterval( this.playForTimer );

                console.log( 'Timer expired, stopping at:' + Date.now() );
                
                this.filePlaying === 1 ? this.fadeOut( 'track1', true ) : this.fadeOut( 'track2', true );
                
            }
        }, this.playForDurationIncrement );
    }

    setupAlternatingPlay(){

        this.timer = setInterval( ()=>{

            if( this.filePlaying === 1 ){

                this.nativeAudio.setVolumeForComplexAsset( 'track2', this.initVolume ).then( ()=>{

                    console.log( 'SUCCESS: set volume native audio track2' );

                    this.nativeAudio.play( 'track2' ).then( ()=>{

                        console.log( 'SUCCESS: PLAY native audio track2' );

                        this.filePlaying = 2;

                        setTimeout( ()=>{
    
                            this.fadeOut( 'track1' );
                        }, 500 );
    
                        console.log( 'file 2 started from interval' );
                    },( msg )=>{

                        console.log( 'FAIL: PLAY native audio track2' );
                        console.log( msg );
                        
                    } );
                },()=>{

                    console.log( 'FAIL: set volume native audio track2' );
                } );                    
            }
            else{

                this.nativeAudio.setVolumeForComplexAsset( 'track1', this.initVolume ).then( ()=>{

                    this.nativeAudio.play( 'track1' ).then( ()=>{

                        console.log( 'SUCCESS: PLAY native audio track1' );

                        this.filePlaying = 1;

                        setTimeout( ()=>{
    
                            this.fadeOut( 'track2' );
                        }, 500 );
                        
                        console.log( 'file 1 started from interval' );
                    },( msg )=>{

                        console.log( 'FAIL: PLAY native audio track1:2' );
                        console.log( msg );

                    } );
                },()=>{} );
            }
            
        }, this.fileAlternateIncrement );
    }

    play( track? ){
        return new Promise( ( resolve, reject )=>{

            if( track !== undefined ){

                this.filePlayingDuration = track.duration;
            }
            //if we don't have a track, this is a resume operation
            //and the filePlayingDuration will be set
            else{
                
            }
            
            //how close to end of file we initiate alternation of playing track
            //duration of file in ms, substract desired increment
            this.fileAlternateIncrement = ( this.filePlayingDuration * 1000 ) - 3000 ;

            console.log( 'File Duration: ' + this.filePlayingDuration + 'sec' );

            console.log( 'Alternate Increment: ' + this.fileAlternateIncrement + 'ms' );

            try{
    
                this.nativeAudio.play( 'track1' ).then( ()=>{

                    console.log( 'SUCCESS: PLAY native audio' );

                    this.playStartedAt = Date.now();

                    this.filePlaying = 1;

                    console.log( 'file 1 started, at: ' + this.playStartedAt );

                    this.setupAlternatingPlay();

                    this.setPlayForTimer();

                    this.isPlaying = true; 

                    this.isPaused = false;    

                    this.isStopped = false;

                    resolve();
                },( msg )=>{

                    console.log( 'FAIL: PLAY native audio track1' );
                    console.log( msg );
                } );           
            }
            catch( e ){

                console.log( 'Player: Play Fail' );
                console.log( e );
            }

            //these should maybe be in the setup alternating play.
            //but, if that fails in browser, this keeps the UI working
            
        } );
    }

    pause( ){
        //considering the timed play/interval construct, 
        //pause is not a reasonable state. 
        //Just stop.
        /*try{

            clearInterval( this.timer );
            clearInterval( this.volumeTimer );
            clearInterval( this.volumeTimer2 );
            clearInterval( this.playForTimer );
            
            this.file.pause();
            this.file2.pause();
        }
        catch( e ){
            
            console.log( 'Player: Pause' );
            //console.log( e );
        }
        this.isPlaying = false;
        this.isPaused = true;
        this.isStopped = false;*/
        this.stop();
    }

    stop(){
        return new Promise( ( resolve, reject )=>{
            // stop playing the file
            try{

                clearInterval( this.timer );

                clearInterval( this.volumeTimer );

                clearInterval( this.volumeTimer2 );
                
                clearInterval( this.playForTimer );

                this.timerIsActive = false;

                this.timerStopped.emit();

                this.nativeAudio.stop( 'track1' ).then( ()=>{

                    this.nativeAudio.stop( 'track2' ).then( ()=>{

                        this.releaseFile(); 

                        this.stopNotification.emit();

                        this.isPlaying = false; 

                        this.isPaused = false;    

                        this.isStopped = true;

                        resolve();
                    }, ()=>{} );
                }, ()=>{} );
            }
            catch( e ){

                console.log( 'Player: Stop Fail' );
            }
        } );
    }
}