// Import our custom CSS
import './scss/style.scss'
import 'bootstrap/js/dist/collapse'
import 'bootstrap/js/dist/dropdown'
import { Router } from "./router";

class App {
	private router: Router;

	constructor() {
		this.router = new Router();
		window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this));
		window.addEventListener('popstate', this.handleRouteChanging.bind(this));
	}

	private handleRouteChanging() {
		this.router.openRoute();
	}

}

(new App());