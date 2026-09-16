import { Routes } from '@angular/router';
import { TierListPage } from './features/tier-list/tier-list-page/tier-list-page';
import { StaffComparatorPage } from './features/staff-comparator/staff-comparator-page/staff-comparator-page';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'tier-list', pathMatch: 'full' },
  { path: 'tier-list', title: 'AnimeToolkit - Tier List', component: TierListPage },
  { path: 'staff-comparator', title: 'AnimeToolkit - Staff Comparator', component:StaffComparatorPage }
];
