import { CustomHttp } from "../services/custom-http";
import config from "../../config/config";
import { BalanceType } from "../types/balance.type";
import { DefaultResponseType } from "../types/default-response.type";
import { AllOperationsType } from "../types/all-operations.type";


export class AllOperations {
	public period: string;

	private tbody: HTMLElement | null;
	private operations: AllOperationsType[];
	private balance: BalanceType;

	constructor() {

		this.tbody = document.getElementById('tbody');

		this.operations = [];
		this.balance = {
			balance: 0
		};
		this.period = ''

		this.getOperations();
		this.initializeButtons();
	}

	private async getBalance(): Promise<void> {
		try {
			this.balance = await CustomHttp.request(config.host + '/balance');
		}
		catch (error) {
			console.log(error);
			return;
		}
		const money: HTMLElement | null = document.getElementById('money');
		if (money) {
			money.innerText = this.balance.balance + "$";
		}
	}

	private async getOperations(period?: string, dateFrom?: string, dateTo?: string): Promise<any> {
		let url: string = "/operations"

		if (period) {
			url += '?period=' + period;
		}

		if (period === 'interval') {
			url += '&dateFrom=' + dateFrom;
			url += '&dateTo=' + dateTo;
		}

		try {
			const result = await CustomHttp.request(config.host + url);

			if (result) {
				if (result.error) {
					throw new Error(result.error);
				}
				this.operations = result as AllOperationsType[];
				this.getBalance();
				this.allOperations();
			}
		} catch (error) {
			console.log(error);
			return;
		}
	}

	private initializeButtons(): void {
		const buttons: any = document.getElementsByClassName('button-date-action');
		for (let button of buttons) {
			switch (button.id) {
				case 'main-today-button':
					button.onclick = () => {
						this.period = '';
						this.setActiveButton(button);
						this.deleteTbody();
						this.getOperations();
					};
					break;
				case 'main-week-button':
					button.onclick = () => {
						this.period = 'week';
						this.setActiveButton(button);
						this.deleteTbody();
						this.getOperations(this.period)

					};
					break;
				case 'main-month-button':
					button.onclick = () => {
						this.period = 'month';
						this.setActiveButton(button);
						this.deleteTbody();
						this.getOperations(this.period);
					};
					break;
				case 'main-year-button':
					button.onclick = () => {
						this.period = 'year';
						this.setActiveButton(button);
						this.deleteTbody();
						this.getOperations(this.period);
					};
					break;
				case 'main-all-button':
					button.onclick = () => {
						this.period = 'all';
						this.setActiveButton(button);
						this.deleteTbody();
						this.getOperations(this.period);
					};
					break;
				case 'main-interval-button':
					button.onclick = () => {
						this.period = 'interval'
						this.setActiveButton(button);
						this.deleteTbody();

						const dateForm: HTMLInputElement | null = document.getElementById('dateForm') as HTMLInputElement;
						const dateTo: HTMLInputElement | null = document.getElementById('dateTo') as HTMLInputElement;;

						if (dateForm.value && dateTo.value) {
							this.getOperations(this.period, dateForm.value, dateTo.value);
						}

						dateForm.onchange = () => {
							if (this.period === 'interval' && dateForm.value && dateTo.value) {
								this.getOperations(this.period, dateForm.value, dateTo.value);
							}
						};

						dateTo.onchange = () => {
							if (this.period === 'interval' && dateTo.value && dateForm.value) {
								this.getOperations(this.period, dateForm.value, dateTo.value);
							}
						};

					};
					break;
			}
		}
	}

	private deleteTbody(): void {
		const old_tbody: HTMLElement | null = document.getElementById("tbody");
		this.tbody = document.createElement('tbody') as HTMLElement;
		this.tbody.id = 'tbody';
		if (old_tbody?.parentNode) {
			old_tbody.parentNode.replaceChild(this.tbody, old_tbody)
		}
	}

	private allOperations(): void {
		if (this.operations && this.operations.length > 0) {
			this.operations.forEach((operation: AllOperationsType) => {
				const that: AllOperations = this;
				const operationsTrElement: HTMLElement | null = document.createElement('tr');
				operationsTrElement.className = 'tr'

				const operationsNumberElement: HTMLElement | null = document.createElement('th');
				operationsNumberElement.className = 'number';
				operationsNumberElement.innerText = operation.id.toString();
				operationsNumberElement.setAttribute('scope', 'row')

				const operationsTypeElement: HTMLElement | null = document.createElement('td');
				operationsTypeElement.className = 'text-green type';
				operationsTypeElement.innerText = operation.type;
				if (operation.type === 'expense') {
					operationsTypeElement.innerText = 'расход'
					operationsTypeElement.style.color = '#DC3545';

				}
				if (operation.type === 'income') {
					operationsTypeElement.innerText = 'доход'
					operationsTypeElement.style.color = '#198754';
				}

				const operationsCategoryElement: HTMLElement | null = document.createElement('td');
				operationsCategoryElement.className = 'category';
				operationsCategoryElement.innerText = operation.category;

				const operationsAmountElement: HTMLElement | null = document.createElement('td');
				operationsAmountElement.className = 'amount';
				operationsAmountElement.innerText = operation.amount + '$';

				const operationsDateElement: HTMLElement | null = document.createElement('td');
				operationsDateElement.className = 'date';
				const data = new Date(operation.date);
				operationsDateElement.innerText = data.toLocaleDateString();

				const operationsCommentElement: HTMLElement | null = document.createElement('td');
				operationsCommentElement.className = 'comment';
				operationsCommentElement.innerText = operation.comment;

				const operationsIconsElement: HTMLElement | null = document.createElement('td');
				operationsIconsElement.className = 'td-union-stroke';

				const operationsIconElement: HTMLElement | null = document.createElement('a');
				operationsIconElement.className = 'a-union';
				operationsIconElement.style.cursor = 'pointer'
				operationsIconElement.setAttribute('data-id', operation.id.toString())
				operationsIconElement.onclick = function () {
					that.operationDelete(<HTMLElement>this);
				}

				const operationsImageElement: HTMLElement | null = document.createElement('img');
				operationsImageElement.setAttribute('src', '/images/union.png');
				operationsImageElement.setAttribute('alt', 'Корзина');

				const operationsIconTwoElement: HTMLElement | null = document.createElement('a');
				operationsIconTwoElement.className = 'a-stroke';
				operationsIconTwoElement.style.cursor = 'pointer'
				operationsIconTwoElement.setAttribute('data-id', operation.id.toString());
				operationsIconTwoElement.onclick = function () {
					that.operationId(<HTMLElement>this);
				}

				const operationsImageTwoElement: HTMLElement | null = document.createElement('img');
				operationsImageTwoElement.setAttribute('src', '/images/stroke.png');
				operationsImageTwoElement.setAttribute('alt', 'Карандаш');

				operationsIconElement.appendChild(operationsImageElement);
				operationsIconTwoElement.appendChild(operationsImageTwoElement);
				operationsIconsElement.appendChild(operationsIconElement);
				operationsIconsElement.appendChild(operationsIconTwoElement);

				operationsTrElement.appendChild(operationsNumberElement);
				operationsTrElement.appendChild(operationsTypeElement);
				operationsTrElement.appendChild(operationsCategoryElement);
				operationsTrElement.appendChild(operationsAmountElement);
				operationsTrElement.appendChild(operationsDateElement);
				operationsTrElement.appendChild(operationsCommentElement);
				operationsTrElement.appendChild(operationsIconsElement);

				if (this.tbody) {
					this.tbody.appendChild(operationsTrElement);
				}
			});
		}
	}

	private operationId(element: HTMLElement): void {
		const dataId = element.getAttribute('data-id');
		if (dataId) {
			location.href = '#/editing-income-expense?id=' + dataId;
		}
	}

	private operationDelete(element: HTMLElement): void {
		const that: AllOperations = this;
		const popupIncomeAndExpensesYesButton: HTMLElement | null = document.getElementById('popup-income-and-expenses-yes');
		const popupIncomeAndExpensesNoButton: HTMLElement | null = document.getElementById('popup-income-and-expenses-no');

		const popupIncomeAndExpensesElement: HTMLElement | null = document.getElementById('popup-income-and-expenses');
		const operationId: any = element.getAttribute('data-id');
		popupIncomeAndExpensesElement!.style.display = 'block';
		popupIncomeAndExpensesYesButton!.onclick = function () {
			popupIncomeAndExpensesElement!.style.display = 'none';
			that.deleteOperationIncomeAndExpense(operationId);
			location.reload();
		}
		popupIncomeAndExpensesNoButton!.onclick = function () {
			popupIncomeAndExpensesElement!.style.display = 'none';
		}
	}

	private setActiveButton(buttonElement: HTMLElement): void {
		document.querySelectorAll('.active').forEach(item => {
			item.classList.remove('active');
		});
		buttonElement.classList.add('active');
	}

	private async deleteOperationIncomeAndExpense(id: number): Promise<void> {
		try {
			const result: DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + id, "DELETE");
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





