// main.ts ou main bootstrap file

import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';

import { App } from './app/app';
import { appRoutes } from './app/app.routes';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withFetch()), // HttpClient avec Fetch API

    importProvidersFrom(
      CommonModule,
      FormsModule,
      DragDropModule,
      RouterModule.forRoot(appRoutes),
    ),
  ]
}).catch(err => console.error(err));
