import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseRoutingModule } from './expense-routing.module';
import { IonicModule } from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ExpenseModalComponent } from './expense-modal/expense-modal.component';
import { ExpenseListComponent } from './expense-list/expense-list.component';

@NgModule({
  declarations: [ExpenseModalComponent, ExpenseListComponent],
  imports: [CommonModule, IonicModule, ReactiveFormsModule, ExpenseRoutingModule, FormsModule],
})
export class ExpenseModule {}
