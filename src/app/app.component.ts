import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Media, MediaObject } from '@ionic-native/media';
import { NativeAudio } from '@ionic-native/native-audio';
import { CategoriesPage } from '../pages/categories/categories';
import { TrackListPage } from '../pages/track-list/track-list';
import { AboutPage } from '../pages/about/about';
import { FavoritesPage } from '../pages/favorites/favorites';
import { TabsPage } from '../pages/tabs/tabs';
import { TagsPage } from '../pages/tags/tags';

import { Track } from './track';
import { TracksService } from './tracks.service';
import { PlayerService } from './player.service';
import { CategoriesService } from './categories.service';
import { FavoritesService } from './favorites.service';
import { StorageService } from './storage.service';
import { TimerControlsService } from './timercontrols.service';
import { MediaPlayer } from './mediaPlayer-native';
import { BackgroundMode } from '@ionic-native/background-mode';

@Component({
  templateUrl: 'app.html',
  providers: [ Track, TracksService, PlayerService, CategoriesService, FavoritesService, StorageService, TimerControlsService, StatusBar, SplashScreen, Media, NativeAudio, MediaPlayer,BackgroundMode ]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make CategoriesPage the root (or first) page
  rootPage: any = TabsPage;
  pages: Array<{title: string, component: any}>;
  playing: boolean = false;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public playerService: PlayerService,
    public statusBar: StatusBar,
    public splash: SplashScreen,
    private backgroundMode: BackgroundMode
  ) {

    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'Sound Types', component: CategoriesPage },
      { title: 'Sounds', component: TrackListPage },
      { title: 'About', component: AboutPage },
      { title: 'Favorites', component: FavoritesPage },
      { title: 'Tags', component: TagsPage }
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.backgroundMode.enable();
      this.statusBar.styleBlackTranslucent();
      this.splash.hide();
    });
  }

  openPage(page) {
    
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
}
