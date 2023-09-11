import { CustomHttp } from "../services/custom-http";
import config from "../../config/config";
import { AllCategoriesType } from "../types/all-categories.type";
import { BalanceType } from "../types/balance.type";
import { DefaultResponseType } from "../types/default-response.type";
import { AllOperationsType } from "../types/all-operations.type";


export class AllCategoriesIncomes {

	readonly incomesCategoryElement: HTMLElement | null
	private categories: AllCategoriesType[] = [];
	private balance: BalanceType;

	constructor() {
		this.incomesCategoryElement = document.getElementById('row-income-category');

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
			this.categories = await CustomHttp.request(config.host + '/categories/income');
		} catch (error) {
			console.log(error);
			return;
		}
		this.allCategoriesIncome();
		this.getBalance();
	}

	allCategoriesIncome() {
		if (this.categories && this.categories.length > 0) {
			this.categories.forEach((category: AllCategoriesType) => {
				const that: AllCategoriesIncomes = this;
				const categoryElement: HTMLElement | null = document.createElement('div');
				categoryElement.className = 'col-4 category';

				const titleElement: HTMLElement | null = document.createElement('h2');
				titleElement.className = 'title-head';
				titleElement.innerText = category.title;

				const incomesEditElement: HTMLElement | null = document.createElement('button');
				incomesEditElement.className = 'income-edit btn btn-primary';
				incomesEditElement.innerText = 'Редактировать';
				incomesEditElement.setAttribute('data-id', category.id.toString());
				incomesEditElement.onclick = function () {
					that.categoryId(<HTMLElement>this);
				}

				const incomesDeleteElement: HTMLElement | null = document.createElement('button');
				incomesDeleteElement.className = 'income-delete btn btn-danger';
				incomesDeleteElement.innerText = 'Удалить';
				incomesDeleteElement.setAttribute('data-id', category.id.toString())
				incomesDeleteElement.onclick = function () {
					that.categoryDelete(<HTMLElement>this);
				}

				categoryElement.appendChild(titleElement);
				categoryElement.appendChild(incomesEditElement);
				categoryElement.appendChild(incomesDeleteElement);

				if (this.incomesCategoryElement) {
					this.incomesCategoryElement.appendChild(categoryElement);
				}

				const add: HTMLElement | any = document.getElementById('add');
				if (this.incomesCategoryElement) {
					this.incomesCategoryElement.appendChild(add);
				}

			});
		}
	}

	private categoryId(element: HTMLElement): void {
		const dataId = element.getAttribute('data-id');
		if (dataId) {
			location.href = '#/editing-income-category?id=' + dataId;
		}
	}

	private categoryDelete(element: HTMLElement): void {
		const popupIncomesYesButton: HTMLElement | null = document.getElementById('popup-incomes-yes') as HTMLElement;
		const popupIncomesNoButton: HTMLElement | null = document.getElementById('popup-incomes-no') as HTMLElement;
		const popupIncomesElement: HTMLElement | null = document.getElementById('popup-incomes') as HTMLElement;
		const dataId: string | null = element.getAttribute('data-id');
		popupIncomesElement.style.display = 'block';
		popupIncomesYesButton.onclick = async () => {
			popupIncomesElement.style.display = 'none';
			const dataIdNumber = Number(dataId);
			if (dataIdNumber) {
				this.deleteCategoryIncome(dataIdNumber);
			}
			const categoryToDelete: AllCategoriesType | undefined = this.categories.find(item => {
				item.id === dataIdNumber
			})
			const operations: AllOperationsType[] = await CustomHttp.request(config.host + "/operations?period=all");
			operations.forEach(async (operation) => {
				if (operation.category === categoryToDelete?.title) {
					await CustomHttp.request(config.host + "/operations/" + operation.id, "DELETE");
					let newBalance = Number(this.balance.balance) - operation.amount;
					await CustomHttp.request(config.host + "/balance", "PUT", { newBalance: newBalance });
				}
			});
			location.reload();
		}

		popupIncomesNoButton.onclick = function () {
			popupIncomesElement.style.display = 'none';
		}
	}

	async deleteCategoryIncome(id: number) {
		try {
			const result: DefaultResponseType | AllCategoriesType[] = await CustomHttp.request(config.host + '/categories/income/' + id, "DELETE");
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