import { Component } from '@angular/core';

import { CategoriesPage } from '../categories/categories';
import { AboutPage } from '../about/about';
import { FavoritesPage } from '../favorites/favorites';
import { TagsPage } from '../tags/tags';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = CategoriesPage;
  tab2Root: any = FavoritesPage;
  tab3Root: any = TagsPage;
  tab4Root: any = AboutPage;

  constructor() {

  }
}
