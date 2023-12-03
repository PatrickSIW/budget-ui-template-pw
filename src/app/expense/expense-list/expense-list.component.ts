import { Component } from '@angular/core';
import { addMonths, set } from 'date-fns';
import { ModalController } from '@ionic/angular';
import { ExpenseModalComponent } from '../expense-modal/expense-modal.component';
import {Category, CategoryCriteria, Expense} from '../../shared/domain';
import {CategoryService} from "../../category/category.service";
import {ToastService} from "../../shared/service/toast.service";

@Component({
  selector: 'app-expense-overview',
  templateUrl: './expense-list.component.html',
})
export class ExpenseListComponent {
  date = set(new Date(), { date: 1 });
  subtractMonth() {
    this.date.setMonth(this.date.getMonth() - 1);
  }
  addMonth() {
    this.date.setMonth(this.date.getMonth() + 1);
  }
  categories: Category[] = [] ;


  constructor(
    private readonly modalCtrl: ModalController,
    private readonly categoryService: CategoryService,
    private readonly toastService: ToastService
              ) {}



  addMonths = (number: number): void => {
    this.date = addMonths(this.date, number);
  };


  async openModal(expense?: Expense): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: { expense: expense ? { ...expense } : {} },
    });
    modal.present();
    const { role } = await modal.onWillDismiss();
    console.log('role', role);
  }
}
