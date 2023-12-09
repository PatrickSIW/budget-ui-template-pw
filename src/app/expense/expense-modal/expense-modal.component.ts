import {from} from "rxjs";
import {Component, NgModule} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { CategoryModalComponent } from '../../category/category-modal/category-modal.component';
import { ActionSheetService } from '../../shared/service/action-sheet.service';
import { Category } from '../../shared/domain';
import { formatISO, parseISO } from 'date-fns';
import {ToastService} from "../../shared/service/toast.service";
import {CategoryService} from "../../category/category.service";

import {FormBuilder, FormGroup, Validators} from "@angular/forms";



@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
})
export class ExpenseModalComponent {
  categories: Category[] = [];
    readonly categoryForm: FormGroup;
    submitting = false;
  expenseService: any;
  expenseForm: any;



  constructor(
    private readonly actionSheetService: ActionSheetService,
    private readonly modalCtrl: ModalController,
    private readonly toastService: ToastService,
    private readonly categoryService: CategoryService,
    private readonly formBuilder: FormBuilder,
  ) {
      this.categoryForm = this.formBuilder.group({
          id: [], // hidden
          name: ['', [Validators.required, Validators.maxLength(40)]],
      });
  }
  private loadAllCategories(): void {
    this.categoryService.getAllCategories({ sort: 'name,asc' }).subscribe({
      next: (categories) => (this.categories = categories),
      error: (error) => this.toastService.displayErrorToast('Could not load categories', error),
    });
  }
  ionViewWillEnter(): void {
      this.loadAllCategories();
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    // Assuming 'expenseService' and 'expenseForm' are properly declared and initialized
    this.expenseService.upsertExpense({
      ...this.expenseForm.value,
      date: formatISO(parseISO(this.expenseForm.value.date), { representation: 'date' }),
    });
    this.modalCtrl.dismiss(null, 'save');
  }

  delete(): void {
    from(this.actionSheetService.showDeletionConfirmation('Are you sure you want to delete this expense?'))
      .pipe(filter((action) => action === 'delete'))
      .subscribe(() => this.modalCtrl.dismiss(null, 'delete'));
  }

  async showCategoryModal(): Promise<void> {
    const categoryModal = await this.modalCtrl.create({ component: CategoryModalComponent });
    categoryModal.present();
    const { role } = await categoryModal.onWillDismiss();
    console.log('role', role);
  }
}
