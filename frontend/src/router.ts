import { Form } from "./components/form";
import { Auth } from "./services/auth";
import { AllCategoriesExpenses } from "./components/all-categories-expenses";
import { AllCategoriesIncomes } from "./components/all-categories-incomes";
import { EditCategoryExpense } from "./components/edit-category-expense";
import { EditCategoryIncome } from "./components/edit-category-income";
import { AddCategoryExpense } from "./components/add-category-expense";
import { AddCategoryIncome } from "./components/add-category-income";
import { AddOperation } from "./components/add-operation";
import { AllOperations } from "./components/all-operations";
import { EditOperation } from "./components/edit-operation";
import { Main } from "./components/main";
import { RouteType } from "./types/route.type";
import { UserInfoType } from "./types/user-info.type";
import { BalanceType } from "./types/balance.type";

export class Router {

	contentElement: HTMLElement | null;
	stylesElement: HTMLElement | null;
	titleElement: HTMLElement | null;
	profileFullNameElement: HTMLElement | null;
	sidebarElement: HTMLElement | null;
	money: HTMLElement | null
	balance: BalanceType;

	private routes: RouteType[];

	constructor() {

		this.contentElement = document.getElementById('content');
		this.stylesElement = document.getElementById('styles');
		this.titleElement = document.getElementById('page-title');
		this.profileFullNameElement = document.getElementById('profile-full-name');
		this.sidebarElement = document.getElementById('sidebar');
		this.money = document.getElementById('money');
		this.balance = {
			balance: 0
		}


		this.routes = [

			{
				route: '#/signup',
				title: 'Регистрация',
				template: 'templates/signup.html',
				styles: 'styles/form.css',
				load: () => {
					new Form('signup');
				}
			},
			{
				route: '#/login',
				title: 'Вход в систему',
				template: 'templates/login.html',
				styles: 'styles/form.css',
				load: () => {
					new Form('login');
				}
			},
			{
				route: '#/',
				title: 'Главная',
				template: 'templates/index.html',
				styles: 'styles/index.css',
				load: () => {
					new Main();
				}
			},
			{
				route: '#/income',
				title: 'Доходы',
				template: 'templates/income.html',
				styles: 'styles/common.css',
				load: () => {
					new AllCategoriesIncomes();
				}
			},
			{
				route: '#/expenses',
				title: 'Расходы',
				template: 'templates/expenses.html',
				styles: 'styles/common.css',
				load: () => {
					new AllCategoriesExpenses();
				}
			},
			{
				route: '#/income-and-expenses',
				title: 'Доходы и расходы',
				template: 'templates/income-and-expenses.html',
				styles: 'styles/income-and-expenses.css',
				load: () => {
					new AllOperations();
				}
			},
			{
				route: '#/editing-income-category',
				title: 'Редактирование категории доходов',
				template: 'templates/editing-income-category.html',
				styles: 'styles/editing-income-expense-category.css',
				load: () => {
					new EditCategoryIncome();
				}
			},
			{
				route: '#/editing-expense-category',
				title: 'Редактирование категории расходов',
				template: 'templates/editing-expense-category.html',
				styles: 'styles/editing-income-expense-category.css',
				load: () => {
					new EditCategoryExpense();
				}
			},
			{
				route: '#/editing-income-expense',
				title: 'Редактирование дохода/расхода',
				template: 'templates/editing-income-expense.html',
				styles: 'styles/generating-income-expense.css',
				load: () => {
					new EditOperation();
				}
			},
			{
				route: '#/generating-income-expense',
				title: 'Создание дохода/расхода',
				template: 'templates/generating-income-expense.html',
				styles: 'styles/generating-income-expense.css',
				load: () => {
					new AddOperation();
				}
			},
			{
				route: '#/creating-expense-category',
				title: 'Создание категории расходов',
				template: 'templates/creating-expense-category.html',
				styles: 'styles/creating-income-expense-category.css',
				load: () => {
					new AddCategoryExpense();
				}
			},
			{
				route: '#/creating-income-category',
				title: 'Создание категории доходов',
				template: 'templates/creating-income-category.html',
				styles: 'styles/creating-income-expense-category.css',
				load: () => {
					new AddCategoryIncome();
				}
			}
		]
	}

	public async openRoute(): Promise<void> {

		const urlRoute: string = window.location.hash.split('?')[0];
		if (urlRoute === '#/logout') {
			const result: boolean = await Auth.logout();
			if (result) {
				window.location.href = '#/login';
				return;
			}
		}

		const newRoute: RouteType | undefined = this.routes.find(item => {
			return item.route === urlRoute;
		});

		if (!newRoute) {
			window.location.href = '#/login';
			if (this.sidebarElement) {
				this.sidebarElement.style.display = 'none';
			}
			return;
		}

		if (!this.contentElement || !this.stylesElement || !this.titleElement
			|| !this.profileFullNameElement || !this.sidebarElement || !this.money) {
			if (urlRoute === '#/') {
				return;
			} else {
				window.location.href = '#/';
				return;
			}
		}

		this.contentElement.innerHTML =
			await fetch(newRoute.template).then(response => response.text());
		this.stylesElement.setAttribute('href', newRoute.styles);
		this.titleElement.innerText = newRoute.title;

		const userInfo: UserInfoType | null = Auth.getUserInfo();
		const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
		if (userInfo && accessToken) {
			this.profileFullNameElement.innerText = userInfo.name + ' ' + userInfo.lastName;
			this.sidebarElement.style.display = 'flex';
			this.money.innerText = this.balance.balance + '$';
		} else {
			this.sidebarElement.style.display = 'none';
		}
		newRoute.load()
	}


}