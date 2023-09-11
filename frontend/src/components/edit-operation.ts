import config from "../../config/config";
import { UrlManager } from "../utils/url-manager";
import { CustomHttp } from "../services/custom-http";
import { AllCategoriesType } from "../types/all-categories.type";
import { BalanceType } from "../types/balance.type";
import { QueryParamsType } from "../types/query-params.type";
import { AllOperationsType } from "../types/all-operations.type";
import { DefaultResponseType } from "../types/default-response.type";
import { AddOperationsType } from "../types/add-operations.type";


export class EditOperation {

	private expenseCategories: AllCategoriesType[];
	private incomeCategories: AllCategoriesType[];
	private editOperation: AllOperationsType;

	private balance: BalanceType;
	private routeParams: QueryParamsType;

	readonly editIncomeExpenseSaveElement: HTMLElement | null;
	readonly editIncomeExpenseCancelElement: HTMLElement | null;

	private operationTypeElement: HTMLSelectElement | null;
	private operationCategoryElement: HTMLSelectElement | null;

	private inputNumberElement: HTMLInputElement | null;
	private inputDateElement: HTMLInputElement | null;
	private inputTextElement: HTMLInputElement | null;

	private money: HTMLElement | null;

	constructor() {

		this.routeParams = UrlManager.getQueryParams();

		this.incomeCategories = [];
		this.expenseCategories = [];
		this.editOperation = {} as AllOperationsType;

		this.balance = {
			balance: 0,
		};

		this.money = document.getElementById('money');

		this.editIncomeExpenseSaveElement = document.getElementById('edit-income-expense-save');
		this.editIncomeExpenseCancelElement = document.getElementById('edit-income-expense-cancel');

		this.operationTypeElement = document.getElementById('select-category-income-expense') as HTMLSelectElement;
		this.operationTypeElement.onchange = (event: any) => {
			this.fillCategoryElement(event.currentTarget.value)
		}

		this.operationCategoryElement = document.getElementById('select-category') as HTMLSelectElement;

		this.inputNumberElement = document.getElementById('input-number') as HTMLInputElement;
		this.inputDateElement = document.getElementById('input-date') as HTMLInputElement;
		this.inputTextElement = document.getElementById('input-text') as HTMLInputElement;

		//кнопка отмены
		if (this.editIncomeExpenseCancelElement) {
			this.editIncomeExpenseCancelElement.onclick = function () {
				location.href = '#/income-and-expenses';
			}
		}

		//кнопка сохранить
		if (this.editIncomeExpenseSaveElement) {
			this.editIncomeExpenseSaveElement.onclick = () => {
				this.updateOperation();
				location.href = '#/income-and-expenses';
			}
		}

		this.init();
	}

	private async init(): Promise<void> {
		this.getBalance().then(() => {
			this.money!.innerText = this.balance.balance + "$";
		});
		this.getOperation(this.routeParams.id).then(async () => {
			await this.getExpenseCategories();
			await this.getIncomeCategories();
			this.prefillOperationEditForm();
		});
	}

	//запрос операции
	private async getOperation(id: string): Promise<void> {
		try {
			this.editOperation = await CustomHttp.request(config.host + '/operations/' + id);
		} catch (error) {
			console.log(error);
			return;
		}
	}

	//запрос категории доходов
	private async getIncomeCategories(): Promise<void> {
		try {
			this.incomeCategories = await CustomHttp.request(config.host + '/categories/income');
		} catch (error) {
			console.log(error);
			return;
		}
	}

	//запрос категории расходов
	private async getExpenseCategories(): Promise<void> {
		try {
			this.expenseCategories = await CustomHttp.request(config.host + '/categories/expense');
		} catch (error) {
			console.log(error);
			return;
		}
	}

	//запрос баланса
	private async getBalance(): Promise<void> {
		try {
			this.balance = await CustomHttp.request(config.host + '/balance');
		} catch (error) {
			console.log(error);
			return;
		}
	}

	//функция показа значение инпутов
	private prefillOperationEditForm(): void {
		this.operationTypeElement!.value = this.editOperation.type;

		this.fillCategoryElement(this.editOperation.type);

		if (this.editOperation.type === "income") {
			let currentOperationCategoryId = this.incomeCategories.find((category) => {
				return category.title === this.editOperation.category
			})?.id;
			if (currentOperationCategoryId) {
				this.operationCategoryElement!.value = currentOperationCategoryId.toString();
			}
		}
		if (this.editOperation.type === "expense") {
			let currentOperationCategoryId = this.expenseCategories.find((category) => {
				return category.title === this.editOperation.category
			})?.id;
			if (currentOperationCategoryId) {
				this.operationCategoryElement!.value = currentOperationCategoryId.toString();
			}
		}

		this.inputNumberElement!.value = this.editOperation.amount.toString()
		this.inputDateElement!.value = this.editOperation.date
		this.inputTextElement!.value = this.editOperation.comment
	}

	private fillCategoryElement(operationType: string): void {
		this.removeCategoryElementOptions();

		if (operationType === 'income') {
			this.incomeCategories.forEach(categoty => {
				const incomeCategoriesOption: HTMLOptionElement = document.createElement("option");
				incomeCategoriesOption.value = categoty.id.toString();
				incomeCategoriesOption.text = categoty.title;
				this.operationCategoryElement!.appendChild(incomeCategoriesOption);
			})
		}

		if (operationType === 'expense') {
			this.expenseCategories.forEach(category => {
				const expenseCategoriesOption: HTMLOptionElement = document.createElement("option");
				expenseCategoriesOption.value = category.id.toString();
				expenseCategoriesOption.text = category.title;
				this.operationCategoryElement!.appendChild(expenseCategoriesOption);
			})
		}
	}


	//обновление селекта
	private removeCategoryElementOptions(): void {
		const options = Array.from(this.operationCategoryElement!.options);
		options.forEach((option) => option.remove());
	}

	//отправка данных инпута
	private async updateOperation(): Promise<void> {
		try {
			const result: DefaultResponseType | AddOperationsType = await CustomHttp.request(config.host + '/operations/' + this.routeParams.id, 'PUT', {
				type: this.operationTypeElement!.value,
				amount: parseInt(this.inputNumberElement!.value),
				date: this.inputDateElement!.value,
				comment: this.inputTextElement!.value,
				category_id: parseInt(this.operationCategoryElement!.value),
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



}

