import { CustomHttp } from "../services/custom-http";
import config from "../../config/config";
import { UrlManager } from "../utils/url-manager";
import { AllCategoriesType } from "../types/all-categories.type";
import { QueryParamsType } from "../types/query-params.type";
import { DefaultResponseType } from "../types/default-response.type";
import { BalanceType } from "../types/balance.type";

export class EditCategoryExpense {
	private categories: AllCategoriesType;
	private balance: BalanceType;

	readonly saveButtonElement: HTMLElement | null;
	readonly cancelButtonElement: HTMLElement | null;
	private inputExpenseElement: HTMLInputElement | null;
	private routeParams: QueryParamsType;

	constructor() {
		this.balance = {
			balance: 0
		};

		this.saveButtonElement = document.getElementById('save');
		this.cancelButtonElement = document.getElementById('cancel');
		this.inputExpenseElement = document.getElementById('input-expense') as HTMLInputElement;
		this.categories = {
			id: 0,
			title: ""
		};
		this.routeParams = UrlManager.getQueryParams();

		if (this.cancelButtonElement) {
			this.cancelButtonElement.onclick = () => {
				location.href = '#/expenses';
			}
		}

		if (this.saveButtonElement) {
			this.saveButtonElement.onclick = () => {
				this.editCategoryExpense();
				location.href = '#/expenses';
			}
		}

		this.init();
	}

	private async init(): Promise<void> {
		if (this.routeParams.id) {
			try {
				const result: DefaultResponseType | AllCategoriesType = await CustomHttp.request(config.host + '/categories/expense/' + this.routeParams.id);
				if (result) {
					if ((result as DefaultResponseType).error !== undefined) {
						throw new Error((result as DefaultResponseType).message);
					}
					this.categories = result as AllCategoriesType;
					this.inputExpenseElement!.value = this.categories.title;
				}
			} catch (error) {
				console.log(error);
				return;
			}
			this.getBalance();
		}
	}


	private async editCategoryExpense(): Promise<void> {
		try {
			const result: DefaultResponseType | AllCategoriesType = await CustomHttp.request(config.host + '/categories/expense/' + this.routeParams.id, "PUT", {
				title: this.inputExpenseElement!.value
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
}