import { CustomHttp } from "../services/custom-http";
import config from "../../config/config";
import { Auth } from "../services/auth";
import { AllCategoriesType } from "../types/all-categories.type";
import { BalanceType } from "../types/balance.type";
import { DefaultResponseType } from "../types/default-response.type";
import { AddOperationsType } from "../types/add-operations.type";

export class AddOperation {
	private expenses: AllCategoriesType[];
	private incomes: AllCategoriesType[];
	private balance: BalanceType;
	private newBalance: number;

	private addExpenseInputCategoryElement: HTMLSelectElement | null;
	private selectCategoryIncomeExpense: HTMLSelectElement | null;
	readonly addIncomeExpenseSaveElement: HTMLElement | null;
	readonly addIncomeExpenseCancelElement: HTMLElement | null;
	private addIncomeExpenseInputNumberElement: HTMLInputElement | null;
	private addIncomeExpenseInputDateElement: HTMLInputElement | null;
	private addIncomeExpenseInputTextElement: HTMLInputElement | null;

	constructor() {

		this.expenses = [];
		this.incomes = [];

		this.addExpenseInputCategoryElement = document.getElementById('select-category') as HTMLSelectElement;
		this.selectCategoryIncomeExpense = document.getElementById('select-category-income-expense') as HTMLSelectElement;

		this.addIncomeExpenseSaveElement = document.getElementById('add-income-expense-save');
		this.addIncomeExpenseCancelElement = document.getElementById('add-income-expense-cancel');

		if (this.addIncomeExpenseCancelElement) {
			this.addIncomeExpenseCancelElement.onclick = function () {
				location.href = '#/income-and-expenses';
			}
		}

		const that: AddOperation = this;
		if (this.addIncomeExpenseSaveElement) {
			this.addIncomeExpenseSaveElement.onclick = function () {
				that.setOperation();
				that.setBalance();
				location.href = '#/income-and-expenses';
			}
		}

		this.addIncomeExpenseInputNumberElement = document.getElementById('input-number') as HTMLInputElement;
		this.addIncomeExpenseInputDateElement = document.getElementById('input-date') as HTMLInputElement;

		this.addIncomeExpenseInputTextElement = document.getElementById('input-text') as HTMLInputElement;
		this.addIncomeExpenseInputTextElement.value = "-";

		this.newBalance = 0;
		this.balance = {
			balance: 0
		};

		this.init();
		this.getBalance()
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
			this.incomes = await CustomHttp.request(config.host + '/categories/income');
		} catch (error) {
			console.log(error);
			return;
		}

		try {
			this.expenses = await CustomHttp.request(config.host + '/categories/expense');
		} catch (error) {
			console.log(error);
			return;
		}
		this.getCategories();
	}

	private getCategories(): void {
		const selectCategoryIncomeExpense: HTMLSelectElement | null = document.getElementById('select-category-income-expense') as HTMLSelectElement;

		selectCategoryIncomeExpense.onchange = () => {
			this.deleteSelectCategory();
			const value: string = selectCategoryIncomeExpense.options[selectCategoryIncomeExpense.selectedIndex].value;
			if (value === 'income') {
				this.getCategoriesIncome();
				this.addIncomeExpenseInputNumberElement = document.getElementById('input-number') as HTMLInputElement;
				this.addIncomeExpenseInputNumberElement.onchange = () => {
					this.newBalance = this.balance.balance + parseInt(this.addIncomeExpenseInputNumberElement!.value)
					console.log(this.newBalance)
				}
			}
			if (value === 'expense') {
				this.getCategoriesExpense();
				this.addIncomeExpenseInputNumberElement = document.getElementById('input-number') as HTMLInputElement;
				this.addIncomeExpenseInputNumberElement.onchange = () => {
					this.newBalance = this.balance.balance - parseInt(this.addIncomeExpenseInputNumberElement!.value)
					console.log(this.newBalance)
				}
			}
		}
	}


	private deleteSelectCategory(): void {
		let options = document.querySelectorAll('#select-category option');
		options.forEach(o => o.remove());
	}


	private getCategoriesExpense(): void {
		if (this.expenses && this.expenses.length > 0) {
			this.expenses.forEach((category: AllCategoriesType) => {
				const addExpenseInputCategoryElement: HTMLInputElement | null = document.getElementById('select-category') as HTMLInputElement;
				const option = document.createElement("option");

				option.value = category.id.toString();
				option.text = category.title;

				addExpenseInputCategoryElement.appendChild(option);
			})
		}
	}


	private getCategoriesIncome(): void {
		if (this.incomes && this.incomes.length > 0) {
			this.incomes.forEach((income: AllCategoriesType) => {
				const addExpenseInputCategoryElement: HTMLInputElement | null = document.getElementById('select-category') as HTMLInputElement;
				const option = document.createElement("option");

				option.value = income.id.toString();
				option.text = income.title;

				addExpenseInputCategoryElement.appendChild(option);
			})
		}
	}

	private async setOperation(): Promise<void> {
		console.log(parseInt(this.addExpenseInputCategoryElement!.options[this.addExpenseInputCategoryElement!.selectedIndex].value))
		try {
			const result: DefaultResponseType | AddOperationsType = await CustomHttp.request(config.host + '/operations', 'POST', {
				type: this.selectCategoryIncomeExpense!.options[this.selectCategoryIncomeExpense!.selectedIndex].value,
				category_id: parseInt(this.addExpenseInputCategoryElement!.options[this.addExpenseInputCategoryElement!.selectedIndex].value),
				amount: parseInt(this.addIncomeExpenseInputNumberElement!.value),
				date: this.addIncomeExpenseInputDateElement?.value,
				comment: this.addIncomeExpenseInputTextElement?.value,
			});
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

	private async setBalance(): Promise<void> {
		try {
			const result: DefaultResponseType | BalanceType = await CustomHttp.request(config.host + '/balance', 'PUT', {
				newBalance: this.newBalance
			});
			if (result) {
				if ((result as DefaultResponseType).error !== undefined) {
					throw new Error((result as DefaultResponseType).message);
				}
			}
		} catch (error) {
			console.log(error);
			return
		}
	}

}

