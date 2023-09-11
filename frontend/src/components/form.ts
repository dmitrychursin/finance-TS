import { CustomHttp } from "../services/custom-http";
import { Auth } from "../services/auth";
import config from "../../config/config";
import { FormFieldType } from "../types/form-field.type";
import { SignupResponseType } from "../types/signup-response.type";
import { LoginResponseType } from "../types/login-response.type";
import { BalanceType } from "../types/balance.type";

export class Form {

	readonly agreeElement: HTMLInputElement | null;
	readonly processElement: HTMLElement | null;
	readonly page: 'signup' | 'login';
	readonly rememberMe: boolean;

	private fields: FormFieldType[] = [];

	constructor(page: 'signup' | 'login') {

		this.agreeElement = null;
		this.processElement = null;
		this.page = page;
		this.rememberMe = false;


		const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
		if (accessToken) {
			location.href = '#/';
			return;
		}

		this.fields = [
			{
				name: 'email',
				id: 'email',
				element: null,
				regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				valid: false,
			},
			{
				name: 'password',
				id: 'password',
				element: null,
				regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
				valid: false,
			},
		];

		if (this.page === 'signup') {
			this.fields.unshift({
				name: 'fullName',
				id: 'full-name',
				element: null,
				regex: /^[А-Я][а-я]*([-][А-Я][а-я]*)?\s[А-Я][а-я]*\s[А-Я][а-я]*$/,
				valid: false,
			});
			this.fields.push({
				name: 'passwordRepeat',
				id: 'password-repeat',
				element: null,
				regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
				valid: false,
			});
		}

		const that: Form = this;
		this.fields.forEach((item: FormFieldType) => {
			item.element = document.getElementById(item.id) as HTMLInputElement;
			if (item.element) {
				item.element.onchange = function () {
					that.validateField.call(that, item, <HTMLInputElement>this);
				}
			}
		});

		this.processElement = document.getElementById('process');
		if (this.processElement) {
			this.processElement.onclick = function () {
				that.processForm();
			}
		}

		if (this.page === 'login') {
			this.agreeElement = document.getElementById('agree') as HTMLInputElement;
			if (this.agreeElement) {
				this.agreeElement.onchange = function () {
					that.validateForm();
				}
			}
		}
	}


	private validateField(field: FormFieldType, element: HTMLInputElement): void {
		if (!element.value || !element.value.match(field.regex)) {
			element.style.borderColor = 'red';
			field.valid = false;
		} else {
			element.removeAttribute('style');
			field.valid = true;
		}
		this.validateForm();
	}


	private validateForm(): boolean {
		const validForm = this.fields.every(item => item.valid);
		if (this.processElement) {
			if (validForm) {
				this.processElement.removeAttribute('disabled');
			} else {
				this.processElement.setAttribute('disabled', 'disabled');
			}
		}
		return validForm;
	}

	private async processForm(): Promise<void> {
		if (this.validateForm()) {
			const email = this.fields.find(item => item.name === 'email')?.element?.value;
			const password = this.fields.find(item => item.name === 'password')?.element?.value;

			if (this.page === 'signup') {
				const passwordRepeat = this.fields.find(item => item.name === 'passwordRepeat')?.element?.value;
				if (password === passwordRepeat) {
					try {

						const name = this.fields.find(item => item.name === 'fullName')?.element?.value.split(' ')[1];
						const lastName = this.fields.find(item => item.name === 'fullName')?.element?.value.split(' ')[0];
						const result: SignupResponseType = await CustomHttp.request(config.host + '/signup', "POST", {
							name: name,
							lastName: lastName,
							email: email,
							password: password,
							passwordRepeat: passwordRepeat,
						});

						if (result) {
							if (result.error || !result.user) {
								throw new Error(result.message);
							}
						}
					} catch (error) {
						console.log(error);
						return;
					}
				} else {
					alert('Пароли не совпадают');
					return;
				}
			}

			try {
				const result: LoginResponseType = await CustomHttp.request(config.host + '/login', "POST", {
					email: email,
					password: password,
					rememberMe: this.rememberMe,
				});

				if (result) {
					if (result.error || !result.tokens.accessToken || !result.tokens.refreshToken || !result.user.lastName
						|| !result.user.name || !result.user.id) {
						throw new Error(result.message);
					}
					Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
					Auth.setUserInfo({
						name: result.user.name,
						user_id: result.user.id,
						lastName: result.user.lastName,
						rememberMe: this.rememberMe,
					})
					location.href = '#/';
				}
			} catch (error) {
				console.log(error);
			}

			try {
				const result: BalanceType = await CustomHttp.request(config.host + '/balance');
				if (result) {
					location.reload();
				}
			} catch (error) {
				return console.log(error);
			}
		}
	}

}

