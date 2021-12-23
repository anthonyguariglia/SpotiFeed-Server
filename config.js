let apiUrl
const apiUrls = {
	production: 'https://pure-harbor-08948.herokuapp.com/',
	development: 'http://localhost:3000',
}

if (window.location.hostname === 'localhost') {
	apiUrl = apiUrls.development
} else {
	apiUrl = apiUrls.production
}

module.exports = {
	apiUrl,
}
