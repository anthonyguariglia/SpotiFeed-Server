let apiUrl
const apiUrls = {
	production: 'https://tic-tac-toe-api-production.herokuapp.com',
	development: 'http://localhost:3000',
}

if (1) {//window.location.hostname === 'localhost') {
	apiUrl = apiUrls.development
} else {
	apiUrl = apiUrls.production
}

module.exports = {
	apiUrl,
}
