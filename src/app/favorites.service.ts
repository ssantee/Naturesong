import { Injectable } from '@angular/core';

import { Track } from './track';
import { TracksService } from './tracks.service';

import { PlayerService } from './player.service';
import { StorageService } from './storage.service';

@Injectable()
export class FavoritesService {

    favoritesList: Array<Track>;
    storageKey: String = 'favorites';

    constructor( private storageService: StorageService, public playerService: PlayerService, private tracksService: TracksService ){

        storageService.get( this.storageKey ).then( ( result )=>{

            this.favoritesList = result;
            this.markFavorites();
        } );
    }

    markFavorites(){

        if( this.favoritesList !== null ){
            this.tracksService.getTracks().then( ( tracks )=>{

                this.favoritesList.forEach( function( val, i, arr ){

                    tracks.forEach( function( tval, ti, tarr ){

                        if( val.id === tval.id ){

                            tval.fav = true;
                        }
                    } );
                } );
            } );
        }
    }

    removePlayState( tracklist ){

        //don't store tracks with a 'playing' state
        tracklist.forEach( function( val, i, arr ){

            val.playing = false;
        } );

        return tracklist;
    }

    getFavoritesAsync(){

        return this.storageService.get( this.storageKey );
    }

    getFavoritesList(): Array<Track> {

        return this.favoritesList;
    }

    addToFavorites( item, currentList ): Promise<Track[]>{

        var wasplaying = item.playing;

        currentList.push( item );

        this.storageService.remove( this.storageKey );

        //kill play state before storage
        currentList = this.removePlayState( currentList );

        this.storageService.set( this.storageKey, currentList );

        this.tracksService.markTrackFav( item );

        this.favoritesList = currentList;
        
        //restore current item play state
        item.playing = wasplaying;

        return Promise.resolve( this.favoritesList );
    }

    removeFromFavorites( item, currentList ): Promise<Track[]>{

        this.storageService.remove( this.storageKey );
        
        //kill play state before storage
        currentList = this.removePlayState( currentList );

        this.storageService.set( this.storageKey, currentList );

        this.tracksService.unmarkTrackFav( item );  
        
        this.favoritesList = currentList;

        //item.playing = true;

        return Promise.resolve( this.favoritesList );
    }

    favoritesDecisions( result, item? ): Promise<Track[]>{

        if( item === undefined ){

            item = this.playerService.getNowPlayingTrack();
        }

        var exists = false,
            returnval;
            
            if( result !== null ){

                result.forEach( function( val, i, arr ){

                    if( item.id === val.id ){
                        exists = true;
                    }
                } );
                
                if( !exists ){
                    //add
                    console.log( '!exists: Add to favs' );
                    returnval = this.addToFavorites( item, result );
                }
                else{
                    //remove
                    console.log( 'exists: Remove from favs' );

                    var newlist = [];

                    result.forEach( function( val, i, arr ){

                        if( val.id !== item.id ){

                            newlist.push( val );
                        }
                    } );

                    returnval = this.removeFromFavorites( item, newlist );
                }
            }
            else{
                //empty list, add
                console.log( 'empty list: add to favs' );
                returnval = this.addToFavorites( item, [] );
            }

            return Promise.resolve( returnval );
    }

    handleFavoriteAction( item? ): Promise<Track[]>{

        var nestedPromise;

        if( item === undefined ){

            item = this.playerService.getNowPlayingTrack();
        }

        nestedPromise = this.getFavoritesAsync();

        return Promise.resolve( nestedPromise );
    }    

}
