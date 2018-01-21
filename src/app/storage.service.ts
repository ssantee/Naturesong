import { Injectable } from '@angular/core';
import { IonicStorageModule, Storage } from '@ionic/storage';

@Injectable()
export class StorageService {

    storage;

    constructor( storage: Storage ){
        
        this.storage = storage;
        //this.storage = new Storage( );
        //this.storage = new Storage(['sqlite', 'websql', 'indexeddb'], { name: '__mydb' });
    }

    get( key ){

        return this.storage.get( key );
    }

    set( key, value ){

        return this.storage.set( key, value );
    }

    remove( key ){

        return this.storage.remove( key );
    }

    clear(  ){

        return this.storage.clear();
    }
}