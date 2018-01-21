import { Injectable } from '@angular/core';
import { Track } from './track';
import { Tracks } from './track-data';

@Injectable()
export class TracksService {

    allTags: Array<String>;

    constructor(){

        var tags = [];

        Tracks.forEach( function( val, i, arr ){

            val.tags.forEach( function( tval, ti, tarr ){

                if( tags.indexOf( tval ) === -1 ){

                    tags.push( tval );
                }
            } );
        } );

        this.allTags = tags;
    }

    public sortTracks( list ){

        list.sort(function (a, b) {

            var nameA = a.name.toUpperCase(); 
            var nameB = b.name.toUpperCase(); 

            if (nameA < nameB) {

                return -1;
            }
            if (nameA > nameB) {
                
                return 1;
            }

            return 0;
        });

        return list;
    }

    getTracks(filter?: string): Promise<Track[]> {
        //console.log(Tracks);

        var tracksFiltered = [];

        if (filter !== undefined && filter !== 'any') {

            Tracks.forEach(function (val, i, arr) {

                if (val.category === filter) {
                    tracksFiltered.push(val);
                }
            });
        }
        else {
            tracksFiltered = Tracks;
        }

        tracksFiltered = this.sortTracks( tracksFiltered );

        return Promise.resolve( tracksFiltered );
    }

    getTrackById( id: string ): Track {

        var track: Track;

        Tracks.forEach( function (val, i, arr) {

            if ( val.id === id ) {
                track = val;
            }
        } );

        return track;
    }

    getTracksByTag( tags: Array<string> ): Promise<Track[]> {

        var tracksFiltered = [];

        Tracks.forEach( function ( val, i, arr ) {

            tags.forEach( function( tval, ti, tarr ){

                //if the track has the tag AND isn't already in the results
                if ( val.tags.indexOf( tval ) !== -1 && tracksFiltered.indexOf( val ) === -1 ) {

                    tracksFiltered.push(val);      
                }                
            } );
        });
        
        tracksFiltered = this.sortTracks( tracksFiltered );

        return Promise.resolve( tracksFiltered );
    }

    getAllTags(): Array<String>{

        return this.allTags;
    }

    //more like, query result to tracks...
    queryToTracks(query): Array<Track> {

        var tracks = [];

        query.forEach(function (qval, qi, qarr) {

            Tracks.forEach(function (val, i, arr) {

                if (val.id === qval.id) {
                    tracks.push(val);
                }
            });
        });

        return tracks;
    }

    getNumberOfTracks(): number {

        return Tracks.length;
    }

    markTrackFav(track) {

        this.getTrackById(track.id).fav = true;
    }

    unmarkTrackFav(track) {

        this.getTrackById(track.id).fav = false;
    }
}
