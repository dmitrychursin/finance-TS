import config from "../../config/config";
import { CustomHttp } from "../services/custom-http";
import { AllCategoriesType } from "../types/all-categories.type";
import { BalanceType } from "../types/balance.type";
import { DefaultResponseType } from "../types/default-response.type";
import { AllOperationsType } from "../types/all-operations.type";

export class AllCategoriesExpenses {
	readonly expensesCategoryElement: HTMLElement | null
	private categories: AllCategoriesType[] = [];
	private balance: BalanceType;

	constructor() {
		this.expensesCategoryElement = document.getElementById('row-expenses-category');

		this.balance = {
			balance: 0
		};

		this.init();
	}

	private async getBalance(): Promise<void> {
		try {
			this.balance = await CustomHttp.request(config.host + '/balance');
		} catch (error) {
			console.log(error);
			return;
		}
		const money: HTMLElement | null = document.getElementById('money');
		if (money) {
			money.innerText = this.balance.balance + "$";
		}
	}

	private async init(): Promise<void> {

		try {
			this.categories = await CustomHttp.request(config.host + '/categories/expense');
		} catch (error) {
			console.log(error);
			return;
		}
		this.fillCategoryExpenses();
		this.getBalance();
	}


	fillCategoryExpenses() {
		if (this.categories && this.categories.length > 0) {
			this.categories.forEach((category: AllCategoriesType) => {
				const that: AllCategoriesExpenses = this;
				const categoryElement: HTMLElement | null = document.createElement('div');
				categoryElement.className = 'col-4 category';

				const titleElement: HTMLElement | null = document.createElement('h2');
				titleElement.className = 'title-head';
				titleElement.innerText = category.title;

				const expensesEditElement: HTMLElement | null = document.createElement('button');
				expensesEditElement.className = 'expenses-edit btn btn-primary';
				expensesEditElement.innerText = 'Редактировать';
				expensesEditElement.setAttribute('data-id', category.id.toString());
				expensesEditElement.onclick = function () {
					that.categoryId(<HTMLElement>this);
				}

				const expensesDeleteElement: HTMLElement | null = document.createElement('button');
				expensesDeleteElement.className = 'expenses-delete btn btn-danger';
				expensesDeleteElement.innerText = 'Удалить';
				expensesDeleteElement.setAttribute('data-id', category.id.toString())
				expensesDeleteElement.onclick = function () {
					that.categoryDelete(<HTMLElement>this);
				}

				categoryElement.appendChild(titleElement);
				categoryElement.appendChild(expensesEditElement);
				categoryElement.appendChild(expensesDeleteElement);

				if (this.expensesCategoryElement) {
					this.expensesCategoryElement.appendChild(categoryElement);
				}
				const add: HTMLElement | any = document.getElementById('add');
				if (this.expensesCategoryElement) {
					this.expensesCategoryElement.appendChild(add);
				}
			});

		}
	}

	private categoryId(element: HTMLElement): void {
		const dataId = element.getAttribute('data-id');
		if (dataId) {
			location.href = '#/editing-expense-category?id=' + dataId;
		}
	}

	private categoryDelete(element: HTMLElement): void {
		const popupExpensesYesButton: HTMLElement | null = document.getElementById('popup-expenses-yes') as HTMLElement;
		const popupExpensesNoButton: HTMLElement | null = document.getElementById('popup-expenses-no') as HTMLElement;
		const popupExpensesElement: HTMLElement | null = document.getElementById('popup-expenses') as HTMLElement;
		const dataId: string | null = element.getAttribute('data-id');
		popupExpensesElement.style.display = 'block';
		popupExpensesYesButton.onclick = async () => {
			popupExpensesElement.style.display = 'none';
			const dataIdNumber = Number(dataId);
			if (dataIdNumber) {
				this.deleteCategoryExpense(dataIdNumber);
			}
			const categoryToDelete: AllCategoriesType | undefined = this.categories.find(item => {
				item.id === dataIdNumber
			})
			const operations: AllOperationsType[] = await CustomHttp.request(config.host + "/operations?period=all");
			operations.forEach(async (operation) => {
				if (operation.category === categoryToDelete?.title) {
					await CustomHttp.request(config.host + "/operations/" + operation.id, "DELETE");
					let newBalance = Number(this.balance.balance) + operation.amount;
					await CustomHttp.request(config.host + "/balance", "PUT", { newBalance: newBalance });
				}
			});

			location.reload();
		}
		popupExpensesNoButton.onclick = function () {
			popupExpensesElement.style.display = 'none';
		}
	}


	async deleteCategoryExpense(id: number) {
		try {
			const result: DefaultResponseType | AllCategoriesType = await CustomHttp.request(config.host + '/categories/expense/' + id, "DELETE");
			if (result) {
				if ((result as DefaultResponseType).error !== undefined) {
					throw new Error((result as DefaultResponseType).message);
				}
			}
		} catch (error) {
			console.log(error);
			return;
		}
	}
}

