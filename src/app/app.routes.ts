import { Routes } from '@angular/router';
import { TierListPage } from './features/tier-list/tier-list-page/tier-list-page';
import { StaffComparatorPage } from './features/staff-comparator/staff-comparator-page/staff-comparator-page';
import { StaffExplorerPage } from './features/staff-explorer/staff-explorer-page/staff-explorer-page';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'tier-list', pathMatch: 'full' },
  { path: 'tier-list', title: 'AnimeToolkit - Tier List', component: TierListPage },
  { path: 'staff-comparator', title: 'AnimeToolkit - Staff Comparator', component:StaffComparatorPage },
  { path: 'staff-comparator/:leftId/:rightId', title: 'AnimeToolkit - Staff Comparator', component:StaffComparatorPage },
  { path: 'staff-explorer', title: 'AnimeToolkit - Staff Explorer', component:StaffExplorerPage },
  { path: 'staff-explorer/:Id', title: 'AnimeToolkit - Staff Explorer', component:StaffExplorerPage },
];
