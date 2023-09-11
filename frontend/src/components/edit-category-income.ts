import { UrlManager } from "../utils/url-manager";
import { CustomHttp } from "../services/custom-http";
import config from "../../config/config";
import { QueryParamsType } from "../types/query-params.type";
import { DefaultResponseType } from "../types/default-response.type";
import { AllCategoriesType } from "../types/all-categories.type";
import { BalanceType } from "../types/balance.type";

export class EditCategoryIncome {
	private categories: AllCategoriesType;
	private balance: BalanceType;

	readonly saveButtonElement: HTMLElement | null;
	readonly cancelButtonElement: HTMLElement | null;
	private inputIncomeElement: HTMLInputElement | null;
	private routeParams: QueryParamsType;

	constructor() {
		this.balance = {
			balance: 0
		};

		this.saveButtonElement = document.getElementById('save');
		this.cancelButtonElement = document.getElementById('cancel');
		this.inputIncomeElement = document.getElementById('input-income') as HTMLInputElement;
		this.categories = {
			id: 0,
			title: ""
		};
		this.routeParams = UrlManager.getQueryParams();

		if (this.cancelButtonElement) {
			this.cancelButtonElement.onclick = () => {
				location.href = '#/income';
			}
		}

		if (this.saveButtonElement) {
			this.saveButtonElement.onclick = () => {
				this.editCategoryIncome();
				location.href = '#/income';
			}
		}

		this.init();
	}


	private async init(): Promise<void> {
		if (this.routeParams.id) {
			try {
				const result: DefaultResponseType | AllCategoriesType = await CustomHttp.request(config.host + '/categories/income/' + this.routeParams.id);
				if (result) {
					if ((result as DefaultResponseType).error !== undefined) {
						throw new Error((result as DefaultResponseType).message);
					}
					this.categories = result as AllCategoriesType;
					this.inputIncomeElement!.value = this.categories.title
				}
			} catch (error) {
				console.log(error);
				return;
			}
			this.getBalance();
		}
	}

	private async editCategoryIncome(): Promise<void> {
		try {
			const result: DefaultResponseType | AllCategoriesType = await CustomHttp.request(config.host + '/categories/income/' + this.routeParams.id, "PUT", {
				title: this.inputIncomeElement!.value
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