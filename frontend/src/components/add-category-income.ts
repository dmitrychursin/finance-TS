import { CustomHttp } from "../services/custom-http";
import config from "../../config/config";
import { CategoryType } from "../types/category.type";
import { DefaultResponseType } from "../types/default-response.type";
import { BalanceType } from "../types/balance.type";

export class AddCategoryIncome {

	readonly saveAddButtonElement: HTMLElement | null;
	readonly cancelAddButtonElement: HTMLElement | null;
	private inputAddIncomeElement: HTMLInputElement | null;

	private balance: BalanceType;

	constructor() {
		this.balance = {
			balance: 0
		};

		this.saveAddButtonElement = document.getElementById('add-save');
		this.cancelAddButtonElement = document.getElementById('add-cancel');
		this.inputAddIncomeElement = document.getElementById('input-add-income') as HTMLInputElement;

		if (this.cancelAddButtonElement) {
			this.cancelAddButtonElement.onclick = () => {
				location.href = '#/income';
			}
		}

		if (this.saveAddButtonElement) {
			this.saveAddButtonElement.onclick = () => {
				this.init();
				location.href = '#/income';
			}
		}

		this.getBalance();
	}

	private async init(): Promise<void> {
		try {
			const result: DefaultResponseType | CategoryType = await CustomHttp.request(config.host + '/categories/income', "POST", {
				title: this.inputAddIncomeElement?.value
			});

			if (result) {
				if ((result as DefaultResponseType).error !== undefined) {
					throw new Error((result as DefaultResponseType).message);
				}
			}
		} catch (error) {
			return console.log(error);
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