import { EventEmitter, Output } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Media, MediaObject } from '@ionic-native/media';

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
    file: MediaObject;
    file2: MediaObject;
    filePlaying;
    filePlayingDuration;
    fileAlternateIncrement;

    @Output() stopNotification: EventEmitter<any> = new EventEmitter();
    @Output() timerStarted: EventEmitter<any> = new EventEmitter();
    @Output() timerStopped: EventEmitter<any> = new EventEmitter();

    constructor( 
        
     ){

        this.platForm = new Platform();

        //at some point, refactor try/catch in audio
        //methods to use this bool 
        this.isDesktop = this.platForm.is( 'core' );
        this.mediaObj = new Media();
    }

    setupFile( path ){

        this.file = this.mediaObj.create(path);

        this.file.onStatusUpdate.subscribe(status => console.log(status));

        this.file2 = this.mediaObj.create(path);

        this.file2.onStatusUpdate.subscribe(status => console.log(status));

        try{

            this.file.onError.subscribe(error => {
                
                console.dir('Error!');
                console.dir(error);
                
                
            
            });
            this.file2.onError.subscribe(error => {
                
                console.dir('Error!');
                console.dir(error);
                
            
            });
            
        }
        catch(err){}
    }

    releaseFile(){

        // release the native audio resource
        // Platform Quirks:
        // iOS simply create a new instance and the old one will be overwritten
        // Android you must call release() to destroy instances of media when you are done
        this.file.release();

        this.file2.release();
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

                file.setVolume( parseFloat(this.volumeTracker.toPrecision(2)) );

                console.log( 'FadeIn set volume to: ' + parseFloat(this.volumeTracker.toPrecision(2)) );
                //console.log(this.volumeTracker);
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

                file.stop();

                this.volumeTracker2 = this.volume;

                this.fading = false;

                console.log( 'fadeout complete' );
            }
            else{

                this.volumeTracker2 = this.volumeTracker2 - this.fadeVolumeIncrement;

                file.setVolume( parseFloat(this.volumeTracker2.toPrecision(2)) );

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
                
                this.filePlaying === 1 ? this.fadeOut( this.file, true ) : this.fadeOut( this.file2, true );
                
                this.stopNotification.emit();

                this.timerIsActive = false;

                this.timerStopped.emit();

                this.isPlaying = false; 

                this.isPaused = false;    

                this.isStopped = true;
            }
        }, this.playForDurationIncrement );
    }

    play( track? ){

        if( track !== undefined ){

            this.filePlayingDuration = track.duration;
        }
        //if we don't have a track, this is a resume operation
        //and the filePlayingDuration will be set
        else{
            //if we are resuming play from pause, the timer can't just
            //be restarted. We have to know from when the track  
            //is being restarted and adjust the timer. 
        }
        
        //how close to end of file we initiate alternation of playing track
        //duration of file in ms, substract desired increment
        this.fileAlternateIncrement = ( this.filePlayingDuration * 1000 ) - 3000 ;

        console.log('File Duration: ' + this.filePlayingDuration + 'sec' );

        console.log( 'Alternate Increment: ' + this.fileAlternateIncrement + 'ms' );

        try{
            
            this.file.setVolume( this.initVolume );
            this.file.play( { playAudioWhenScreenIsLocked : true } );
            

            this.playStartedAt = Date.now();

            this.filePlaying = 1;

            console.log( 'file 1 started, at: ' + this.playStartedAt );
            
            //this.fadeIn( this.file );

            this.timer = setInterval( ()=>{

                //if(!this.fading){}

                if( this.filePlaying === 1 ){

                    this.file2.setVolume( this.initVolume );

                    this.file2.play( { playAudioWhenScreenIsLocked : true } );

                    //this.fadeIn( this.file2 );

                    this.filePlaying = 2;

                    setTimeout( ()=>{

                        this.fadeOut( this.file );
                    }, 500 );

                    console.log( 'file 2 started from interval' );
                }
                else{

                    this.file.setVolume( this.initVolume );

                    this.file.play( { playAudioWhenScreenIsLocked : true } );

                    //this.fadeIn( this.file );

                    this.filePlaying = 1;

                    setTimeout( ()=>{

                        this.fadeOut( this.file2 );
                    }, 500 );
                    
                    console.log( 'file 1 started from interval' );
                }
                
            }, this.fileAlternateIncrement );

            this.setPlayForTimer();           
        }
        catch( e ){

            console.log( 'Player: Play' );
            console.log( e );
        }

        this.isPlaying = true; 

        this.isPaused = false;    

        this.isStopped = false;
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

        // stop playing the file
        try{

            clearInterval( this.timer );

            clearInterval( this.volumeTimer );

            clearInterval( this.volumeTimer2 );
            
            clearInterval( this.playForTimer );

            this.timerIsActive = false;

            this.timerStopped.emit();

            this.file.stop();

            this.file2.stop();

            this.releaseFile(); 

            this.stopNotification.emit();
        }
        catch( e ){

            console.log( 'Player: Stop' );
        }
        
        this.isPlaying = false; 

        this.isPaused = false;    

        this.isStopped = true;
    }
}