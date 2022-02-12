(function() {

	// http://localhost/lojaintegrada/load-products-from-html.html?fq=vCor:0000FF&sort=-preco

	const DELAY = 0;
	const MAX_COLS = 4;
	let OUTPUT;

	const COLORS = [
		{ codes: ['FFFFFF'], aliases: ['branco', 'white'] },
		{ codes: ['000000'], aliases: ['preto', 'black'] },
		{ codes: ['808080'], aliases: ['cinza', 'gray'] },
		{ codes: ['F5F5DC'], aliases: ['bege', 'beige'] },
		{ codes: ['FF0000'], aliases: ['vermelho', 'red'] },
		{ codes: ['FFA500'], aliases: ['laranja', 'orange'] },
		{ codes: ['FFFF00'], aliases: ['amarelo', 'yellow'] },
		{ codes: ['0C9800'], aliases: ['verde', 'green'] },
		{ codes: ['0000FF'], aliases: ['azul', 'blue'] },
		{ codes: ['523C94'], aliases: ['roxo', 'purple'] },
		{ codes: ['7E3A15'], aliases: ['marrom', 'brown'] }
	];

	function showProducts(html, vCor) {
		const newProductGroups = [ [] ];
		const products = html.querySelectorAll('div#listagemProdutos div.listagem-item');
		products.forEach(product => {
			const titleLink = product.querySelector('a.produto-sobrepor');
			const name = titleLink.getAttribute('title');
			const href = titleLink.getAttribute('href');
			const CURRENT_PRODUCTS_URLS = getCurrentProductsUrls();
			if (!CURRENT_PRODUCTS_URLS.includes(href)) {
				if (matchByColor(vCor, name)) {
					const images = product.querySelector('div.imagem-produto');
					const mainImage = images.querySelector('img.imagem-principal');
					const zoomImage = document.createElement('img');
					zoomImage.setAttribute('class', 'imagem-zoom');
					zoomImage.setAttribute('src', mainImage.getAttribute('data-imagem-caminho'));
					images.appendChild(zoomImage);

					const last = newProductGroups[newProductGroups.length - 1];
					if (last.length < MAX_COLS) {
						last.push(product);
					} else {
						newProductGroups.push([product]);
					}
				}
			}
		});

		newProductGroups.forEach(newProducts => {
			if (newProducts.length > 0) {
				const output = OUTPUT.querySelector('ul');
				const newLi = document.createElement('li');
				newLi.setAttribute('class', 'listagem-linha');

				const newUl = document.createElement('ul');

				newProducts.forEach(newProduct => {
					const newLi2 = document.createElement('li');
					newLi2.setAttribute('class', 'span3');

					newLi2.appendChild(newProduct);
					newUl.appendChild(newLi2);
				});

				newLi.appendChild(newUl);
				output.appendChild(newLi);
			}
		});

		return products.length > 0;
	}

	function matchByColor(colorCode, productName) {
		for (let i = 0 ; i < COLORS.length ; i++ ) {
			const color = COLORS[i];
			if (color.codes.includes(colorCode)) {
				const aliases = color.aliases;
				for (let j = 0 ; j < aliases.length ; j++ ) {
					const alias = aliases[j];
					if (productName.toLowerCase().includes(alias)) {
						return true;
					} 
				}
			}
		}
		return false;
	}

	function getSearchParams() {
		const map = {};
		const search = document.location.search.substring(1);
		const parts = search.split('&');
		parts.forEach(part => {
			const keyValue = part.split('=');
			map[keyValue[0]] = unescape(keyValue[1]);
		});
		return map;
	}

	function getParamParts(paramFq) {
		const map = {};
		const keyValue = paramFq.split(':');
		if (keyValue.length == 2) {
			map[keyValue[0]] = keyValue[1];
		}
		return map;
	}

	function escapeEnhanced(str) {
		if (str) {
			str = escape(str);
			str = str.replaceAll('+', '%2B');
		}
		return str;
	}

	function searchOthers(nextUrl, page, vCor, sort) {
		// nextUrl = 'basquete.html?pagina=';
		const url = nextUrl + page + (sort ? '&sort=' + escapeEnhanced(sort) : '');
		console.log('Buscando da URL: ' + url);
		const responsePromise = fetch(url);
		const htmlPromise = responsePromise.then(function(response) {
	  		return response.text();
		});
		htmlPromise.then(function (htmlString) {
			const parser = new DOMParser();
			const html = parser.parseFromString(htmlString, 'text/html');
			const keepSearching = showProducts(html, vCor);
			console.log('Continuar buscando? ' + keepSearching);
			if (keepSearching) {
				if (page > 10) {
					console.log('Parada de contingência!!!');
				} else {
					searchOthers(nextUrl, page + 1, vCor, sort);
				}
			} else {
				console.log('Busca encerrada.');
			}
		});
	}

	function getCurrentUrl() {
		return document.location.href.substring(0, document.location.href.indexOf('?'));
	}

	function getCurrentProductsUrls() {
		const links = document.querySelectorAll('div#listagemProdutos div.listagem-item a.produto-sobrepor');
		return Array.from(links).map(link => link.getAttribute('href'));
	}

	function start() {
		OUTPUT = document.querySelector('#listagemProdutos.listagem.borda-alpha');
		const search = document.location.search;
		if (search) {
			const params = getSearchParams();
			const paramFq = params.fq;
			const paramSort = params.sort;
			const paramFqParts = getParamParts(paramFq);
			if (paramFqParts.vCor) {
				const nextUrl = getCurrentUrl();
				const page = 1;
				searchOthers(nextUrl + '?pagina=', page, paramFqParts.vCor, paramSort);
			}
		}
	}

	// function initButtons() {
	// 	const changeSort = event => {
	// 		const sort = event.target.getAttribute('data-sort');
	// 		const params = getSearchParams();
	// 		const paramFq = params.fq;
	// 		const url = getCurrentUrl();
	// 		const fullUrl = url + '?fq=' + paramFq + '&sort=' + sort;
	// 		window.location.href = fullUrl;
	// 	}
	// 	const buttons = document.querySelectorAll('button[data-sort]');
	// 	buttons.forEach(button => {
	// 		button.addEventListener('click', changeSort);
	// 	});
	// }

	function init() {
		// initButtons();
		start();
	}

	window.addEventListener('load', () => setTimeout(init, DELAY * 1000));
	window.addEventListener('popstate', event => {
		console.log(event);
	});

}());
