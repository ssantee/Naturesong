import { Pipe, PipeTransform } from '@angular/core';
import { Globalization } from '@ionic-native/globalization';
/*
 * Usage:
 *   value | translate:string
 * Example:
 *   {{ 'hello' |  translate}}
*/
@Pipe({ name: 'translate' })
export class TranslatePipe implements PipeTransform {

    language: string;

    constructor( globalize: Globalization ){

        try{

            globalize.getPreferredLanguage().then( ( result )=>{

                this.language = result.value;
                console.log( this.language );
            } ) ;
        }
        catch( e ){

            this.language = 'en';
            console.log( 'globalization not available. default to ' + this.language );
        }
    }

    transform( value: string ): string {
        
        return value + '+';
    }
}
