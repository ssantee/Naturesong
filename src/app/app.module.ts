import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { BrowserModule } from '@angular/platform-browser';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';
import { TabsPage } from '../pages/tabs/tabs';
import { AboutPage } from '../pages/about/about';
import { CategoriesPage } from '../pages/categories/categories';
import { TrackListPage } from '../pages/track-list/track-list';
import { FavoritesPage } from '../pages/favorites/favorites';
import { TagsPage } from '../pages/tags/tags';
import { TranslatePipe } from './translate.pipe';
import { BackgroundMode } from '@ionic-native/background-mode';

@NgModule({
  declarations: [
    MyApp,
    CategoriesPage,
    TrackListPage,
    TranslatePipe,
    TabsPage,
    AboutPage,
    FavoritesPage,
    TagsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    BrowserModule,
    IonicStorageModule.forRoot( {
      name: '__mydb',
      driverOrder: [ 'sqlite', 'websql', 'indexeddb' ]
    } )
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    CategoriesPage,
    TrackListPage,
    TabsPage,
    AboutPage,
    FavoritesPage,
    TagsPage
  ],
  providers: [BackgroundMode,IonicStorageModule, {provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {

}
