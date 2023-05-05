import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqListComponent } from './faq-list/faq-list.component';
import { FaqFormComponent } from './faq-form/faq-form.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';
import { LoaderModule } from '../common/loader/loader.module';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { FaqCategoriesComponent } from './faq-categories/faq-categories.component';
import { FaqCategoryFormComponent } from './faq-category-form/faq-category-form.component';
import { ColorPickerModule } from 'ngx-color-picker';

const routes = [
  { path: 'categories', component: FaqCategoriesComponent },
  { path: 'categories-list/:id', component: FaqListComponent },
  { path: '**', redirectTo: 'categories' },
];

@NgModule({
  declarations: [FaqListComponent, FaqFormComponent, FaqCategoriesComponent, FaqCategoryFormComponent],
  imports: [RouterModule.forChild(routes), CommonModule, MaterialModule, LoaderModule,ClipboardModule,ColorPickerModule],
  providers:[Clipboard],
})
export class FaqModule {}
