import axios from 'axios';
const API_URL = 'http://127.0.0.1:8000';

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;


export default class UsersService{
	
	constructor(){}
	
	
	getUsers() {
		const url = `${API_URL}/api/users/`;
		return axios.get(url).then(response => response.data);
	}  
	getUsersByURL(link){
		const url = `${API_URL}${link}`;
		return axios.get(url).then(response => response.data);
	}
	getUser(pk) {
		const url = `${API_URL}/api/user/${pk}`;
		return axios.get(url).then(response => response.data);
	}

	getUserCards(pk) {
		const url = `${API_URL}/api/user_cards/${pk}`;
		return axios.get(url).then(response => response.data);
	}

	getUserCardTransactions(pk, monobank_id) {
		const url = `${API_URL}/api/user_card_transactions_view/${pk}/${monobank_id}`;
		return axios.get(url).then(response => response.data);
	}
	postTestData(test_data) {
		const data = {test_data}
		const url = `${API_URL}/api/test_data`;
		console.log(url);
		console.log(data);
		return axios.post(url, data).then(response => response.data);
	}

	filterUserCardTransactions(pk, monobank_id, mcc, startDate, endDate, amountLT, amountGT) {
		const url = `${API_URL}/api/user_card_transactions_view/${pk}/${monobank_id}`;
		const data = {mcc, startDate, endDate, amountLT, amountGT}
		return axios.post(url, data).then(response => response.data);
	}

	filterUserCardTransactionsCompare(pk, monobank_id, startDateFirst, endDateFirst, startDateSecond, endDateSecond) {
		const url = `${API_URL}/api/user_card_transactions_compare/${pk}/${monobank_id}`;
		const data = {startDateFirst, endDateFirst, startDateSecond, endDateSecond}
		return axios.post(url, data).then(response => response.data);
	}

	async getCurrentMonthTransactions(pk, monobank_id) {
		const url = `${API_URL}/api/user_card_transactions_compare/${pk}/${monobank_id}`;
		try {
		  const response = await axios.get(url);
		  return response.data;
		} catch (error) {
		  // Обробка помилки отримання даних
		  console.log('ERROR:', error);
		  throw error;
		}
	  }

	deleteUser(user){
		const url = `${API_URL}/api/user/${user.pk}`;
		return axios.delete(url);
	}
	createUser(user){
		const url = `${API_URL}/api/user/`;
		return axios.post(url,user);
	}
	updateUser(user){
		const url = `${API_URL}/api/user/${user.pk}`;
		return axios.put(url, user);
	}

	transactionDetail(id){
		const url = `${API_URL}/api/transaction_detail/${id}`;
		return axios.get(url).then(response => response.data)
	}

	transactionDetailPost(id, comment){
		const url = `${API_URL}/api/transaction_detail/${id}`;
		const data = { comment }
		return axios.post(url, data).then(response => response.data)
	}

}