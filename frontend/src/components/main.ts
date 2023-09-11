import config from "../../config/config";
import { CustomHttp } from "../services/custom-http";
import Chart from 'chart.js/auto';
import { Auth } from "../services/auth";
import { AllOperationsType } from "../types/all-operations.type";
import { DefaultResponseType } from "../types/default-response.type";
import { BalanceType } from "../types/balance.type";


export class Main {

	private period;

	private incomeChart: any;
	private incomeChartConfig: any;
	private incomeCategoriesLabels: any;
	private incomeOperationsReduced: any;

	private expenseChart: any;
	private expenseChartConfig: any;
	private expenseCategoriesLabels: any;
	private expenseOperationsReduced: any;

	private operationsAll: AllOperationsType[] = [];
	private balance: BalanceType;

	constructor() {

		this.incomeChart;
		this.incomeChartConfig;
		this.incomeCategoriesLabels;
		this.incomeOperationsReduced;

		this.expenseChart;
		this.expenseChartConfig;
		this.expenseCategoriesLabels;
		this.expenseOperationsReduced;

		this.period = ''
		this.operationsAll = [];
		this.balance = {
			balance: 0
		};

		this.getBalance();
		this.initializeButtons();
		this.initializeCharts();
		this.getOperations();
	}


	private async getBalance(): Promise<void> {
		try {
			const result: DefaultResponseType | BalanceType = await CustomHttp.request(config.host + '/balance');
			if (result) {
				if ((result as DefaultResponseType).error !== undefined) {
					throw new Error((result as DefaultResponseType).message);
				}
				this.balance = result as BalanceType
			}
		} catch (error) {
			console.log(error);
			return
		}
		const money: HTMLElement | null = document.getElementById('money');
		if (money) {
			money.innerText = this.balance.balance + "$";
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
						this.getOperations();
					};
					break;
				case 'main-week-button':
					button.onclick = () => {
						this.period = 'week';
						this.setActiveButton(button);
						this.getOperations(this.period);
					};
					break;
				case 'main-month-button':
					button.onclick = () => {
						this.period = 'month';
						this.setActiveButton(button);
						this.getOperations(this.period);
					};
					break;
				case 'main-year-button':
					button.onclick = () => {
						this.period = 'year';
						this.setActiveButton(button);
						this.getOperations(this.period);
					};
					break;
				case 'main-all-button':
					button.onclick = () => {
						this.period = 'all';
						this.setActiveButton(button);
						this.getOperations(this.period);
					};
					break;
				case 'main-interval-button':
					button.onclick = () => {
						this.period = 'interval';
						this.setActiveButton(button);

						const dateForm: HTMLInputElement | null = document.getElementById('dateForm') as HTMLInputElement;
						const dateTo: HTMLInputElement | null = document.getElementById('dateTo') as HTMLInputElement;

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


	private initializeCharts(): void {
		const incomeChartContext: HTMLCanvasElement | null = document.getElementById('my-chart-incomes') as HTMLCanvasElement;
		this.incomeChartConfig = {
			type: 'pie',
			data: {
				labels: [],
				datasets: [
					{
						label: "Доходы",
						data: [],
						backgroundColor: [
							'rgba(255, 99, 132, 0.9)',
							'rgba(255, 159, 64, 0.9)',
							'rgba(255, 205, 86, 0.9)',
							'rgba(75, 192, 192, 0.9)',
							'rgba(54, 162, 235, 0.9)',
							'rgba(153, 102, 255, 0.9)',
							'rgba(2,112,248,0.9)'
						],
					},
				]
			},
		}
		this.incomeChart = new Chart(incomeChartContext, this.incomeChartConfig);

		const expenseChartContext: HTMLCanvasElement | null = document.getElementById('my-chart-expenses') as HTMLCanvasElement;
		this.expenseChartConfig = {
			type: 'pie',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Расходы',
						data: [],
						backgroundColor: [
							'rgba(255, 99, 132, 0.9)',
							'rgba(255, 159, 64, 0.9)',
							'rgba(255, 205, 86, 0.9)',
							'rgba(75, 192, 192, 0.9)',
							'rgba(54, 162, 235, 0.9)',
							'rgba(153, 102, 255, 0.9)',
							'rgba(2,112,248,0.9)'
						],
					},
				]
			},
		}
		this.expenseChart = new Chart(expenseChartContext, this.expenseChartConfig);
	}

	private updateCharts(): void {
		this.incomeChartConfig.data.labels = this.incomeCategoriesLabels;
		this.incomeChartConfig.data.datasets[0].data = this.incomeOperationsReduced;
		this.incomeChart.update();

		this.expenseChartConfig.data.labels = this.expenseCategoriesLabels;
		this.expenseChartConfig.data.datasets[0].data = this.expenseOperationsReduced;
		this.expenseChart.update();
	}

	private prepareDataForCharts(): void {
		const incomeOperations = this.operationsAll.filter(value => value.type === 'income');
		this.incomeCategoriesLabels = Array.from(
			new Set(incomeOperations.map((operation: AllOperationsType) => operation.category))
		),
			this.incomeOperationsReduced = Object.values(incomeOperations.reduce((acc, { category, amount }) => {
				acc[category] ? acc[category] += amount : acc[category] = amount;
				return acc
			}, {} as { [key: string]: number }))

		const expenseOperations = this.operationsAll.filter(value => value.type === 'expense');
		this.expenseCategoriesLabels = Array.from(
			new Set(expenseOperations.map((operation: AllOperationsType) => operation.category))
		),
			this.expenseOperationsReduced = Object.values(expenseOperations.reduce((acc, { category, amount }) => {
				acc[category] ? acc[category] += amount : acc[category] = amount;
				return acc
			}, {} as { [key: string]: number }))
	}

	private setActiveButton(buttonElement: HTMLElement | null): void {
		document.querySelectorAll('.active').forEach(item => {
			item.classList.remove('active');
		});
		if (buttonElement) {
			buttonElement.classList.add('active');
		}
	}

	private async getOperations(period?: string, dateFrom?: string, dateTo?: string): Promise<void> {
		let url: string = "/operations"

		if (period) {
			url += '?period=' + period;
		}

		if (period === 'interval') {
			url += '&dateFrom=' + dateFrom;
			url += '&dateTo=' + dateTo;
		}

		try {
			const result: DefaultResponseType | AllOperationsType = await CustomHttp.request(config.host + url);
			if (result) {
				if ((result as DefaultResponseType).error !== undefined) {
					throw new Error((result as DefaultResponseType).message);
				}
				this.operationsAll = result as any;
				this.prepareDataForCharts();
				this.updateCharts();
			}
		} catch (error) {
			console.log(error);
		}
	}
}



