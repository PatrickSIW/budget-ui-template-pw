import { Component } from '@angular/core';
import { addMonths, set } from 'date-fns';
import { ModalController } from '@ionic/angular';
import { ExpenseModalComponent } from '../expense-modal/expense-modal.component';
import {Category, CategoryCriteria, Expense} from '../../shared/domain';
import {CategoryService} from "../../category/category.service";
import {ToastService} from "../../shared/service/toast.service";
import {formatPeriod} from "../../shared/period";
import {finalize, from, groupBy, mergeMap, of, Subscription, toArray} from "rxjs";
import {FormBuilder, FormGroup} from "@angular/forms";

interface ExpenseGroup {
  date: string;
  expenses: Expense[];
}
@Component({
  selector: 'app-expense-overview',
  templateUrl: './expense-list.component.html',
})
export class ExpenseListComponent {
  date = set(new Date(), { date: 1 });
  searchCriteria: any;
  readonly searchForm: FormGroup;
  expenseService: any;
  lastPageReached: any;
  loading: boolean = false;
  expenseGroups: any;
  initialSort: any;
  categories: Category[] = [];


  subtractMonth() {
    this.date.setMonth(this.date.getMonth() - 1);
    //this.date.setMonth(this.date.add(1,"months"));
  }
  addMonth() {
    this.date.setMonth(this.date.getMonth() + 1);
    console.log(this.date)
    console.log(this.categories)
  }

  constructor(
    private readonly modalCtrl: ModalController,
    private readonly categoryService: CategoryService,
    private readonly toastService: ToastService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.searchForm = this.formBuilder.group({ name: [], sort: [this.initialSort] });
  }

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
  private loadExpenses(next: () => void = () => {}): void {
    this.searchCriteria.yearMonth = formatPeriod(this.date);
    if (!this.searchCriteria.categoryIds?.length) delete this.searchCriteria.categoryIds;
    if (!this.searchCriteria.name) delete this.searchCriteria.name;
    this.loading = true;
    const groupByDate = this.searchCriteria.sort.startsWith('date');
    this.expenseService
      .getExpenses(this.searchCriteria)
      .pipe(
        finalize(() => (this.loading = false)),
        mergeMap((expensePage) => {
          // @ts-ignore
          this.lastPageReached = expensePage.last;
          next();
          if (this.searchCriteria.page === 0 || !this.expenseGroups) this.expenseGroups = [];
          // @ts-ignore
          return from(expensePage.content).pipe(
            groupBy((expense) => (groupByDate ? expense.date : expense.id)),
            mergeMap((group) => group.pipe(toArray())),
          );
        }),
      )
      .subscribe({
        next: (expenses: Expense[]) => {
          const expenseGroup: ExpenseGroup = {
            date: expenses[0].date,
            expenses: this.sortExpenses(expenses),
          };
          const expenseGroupWithSameDate = this.expenseGroups!.find((other:any) => other.date === expenseGroup.date);
          if (!expenseGroupWithSameDate || !groupByDate) this.expenseGroups!.push(expenseGroup);
          else
            expenseGroupWithSameDate.expenses = this.sortExpenses([
              ...expenseGroupWithSameDate.expenses,
              ...expenseGroup.expenses,
            ]);
        },
        error: (error: any) => this.toastService.displayErrorToast('Could not load expenses', error),
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

  private sortExpenses = (expenses: Expense[]): Expense[] => expenses.sort((a, b) => a.name.localeCompare(b.name));

  protected readonly of = of;
}
