import { Injectable } from '@angular/core';

import { Categories } from './categories';
import { CategoriesData } from './categories-data';

import { Track } from './track';
import { TracksService } from './tracks.service';

@Injectable()
export class CategoriesService {

    catData: Array<Categories>;
    tracks: Array<Track>;
   
    constructor( private tracksService: TracksService ) {
    
    }

    getTracks( filter ): Promise<Track[]>{

        this.tracksService.getTracks( filter ).then(tracks => this.tracks = tracks);

        return Promise.resolve( this.tracks );
    }

    getTracksInCategory( catName ): number{

        var count = 0;

        this.tracks.forEach( function( item, i, arr ){

            if( item.category === catName ){
                count++;
            }
        } );

        return count;
    }

    getCategoryCounts( CategoriesData ): Array<Categories>{
        
        //for inside foreach
        var $this = this;

        this.getTracks( 'any' ).then( function(){

            CategoriesData.forEach( function( item, i, arr ){

                item.trackCount = $this.getTracksInCategory( item.name );
            } );
        } );

        return CategoriesData;
    }



    getCategories(): Promise<Categories[]> {
        
        this.catData = this.getCategoryCounts( CategoriesData );

        return Promise.resolve( this.catData );
    }

}
