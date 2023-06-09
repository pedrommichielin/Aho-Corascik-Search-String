// Variável para armazenar os dados das empresas
let companiesData = [];

// Função para carregar os dados das empresas a partir do arquivo
function loadCompaniesData() {
  // Caminho do arquivo de empresas
  const filePath = 'data/companies.txt';

  // Fazendo uma solicitação HTTP GET para carregar o arquivo de dados
  fetch(filePath)
    .then((response) => response.text()) // Lendo o conteúdo do arquivo como texto
    .then((fileContent) => {
      // Chamando a função para fazer o parsing do conteúdo do arquivo
      companiesData = parseFileContent(fileContent);
      console.log('Dados das empresas carregados:', companiesData);
    })
    .catch((error) => {
      console.error('Erro ao carregar o arquivo:', error);
    });
}

// Função para fazer o parsing do conteúdo do arquivo
function parseFileContent(fileContent) {
  // Dividindo o conteúdo do arquivo em linhas
  const lines = fileContent.split('\n');

  // Mapeando cada linha para obter os dados da empresa
  const companies = lines.map((line) => {
    // Dividindo a linha em nome e descrição da empresa usando ';' como separador
    const [name, description] = line.split(';');
    return { name, description };
  });

  // Retornando os dados das empresas
  return companies;
}

// Função para realizar a busca das empresas
function searchCompanies() {
  // Obtendo o valor digitado no campo de pesquisa
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.trim().toLowerCase();

  // Verificando se o termo de pesquisa não está vazio
  if (searchTerm === '') {
    return;
  }

  // Obtendo a lista de resultados onde os resultados serão exibidos
  const resultsList = document.getElementById('resultsList');
  resultsList.innerHTML = '';

  // Implementação do algoritmo Aho-Corasick
  class AhoCorasickNode {
    constructor(value) {
      this.value = value;
      this.children = new Map();
      this.fail = null;
      this.output = [];
    }
  }

  class AhoCorasick {
    constructor() {
      this.root = new AhoCorasickNode(null);
    }

    addPattern(pattern) {
      let node = this.root;
      for (const char of pattern) {
        if (!node.children.has(char)) {
          node.children.set(char, new AhoCorasickNode(char));
        }
        node = node.children.get(char);
      }
      node.output.push(pattern);
    }

    buildFailureLinks() {
      const queue = [];
      for (const child of this.root.children.values()) {
        queue.push(child);
        child.fail = this.root;
      }

      while (queue.length > 0) {
        const node = queue.shift();
        for (const [char, child] of node.children) {
          queue.push(child);
          let failNode = node.fail;
          while (failNode !== null && !failNode.children.has(char)) {
            failNode = failNode.fail;
          }
          child.fail = failNode !== null ? failNode.children.get(char) : this.root;
          child.output = child.output.concat(child.fail.output);
        }
      }
    }

    search(text) {
      const results = [];
      let node = this.root;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        while (node !== null && !node.children.has(char)) {
          node = node.fail;
        }
        if (node === null) {
          node = this.root;
          continue;
        }
        node = node.children.get(char);
        results.push(...node.output);
      }
      return results;
    }
  }

  // Criando o objeto Aho-Corasick
  const ac = new AhoCorasick();

  // Adicionando os padrões de busca (nomes das empresas)
  companiesData.forEach((company) => {
    ac.addPattern(company.name.toLowerCase());
  });

  // Construindo os links de falha
  ac.buildFailureLinks();

  // Realizando a busca com o algoritmo Aho-Corasick
  const results = ac.search(searchTerm);

  // Filtrando as empresas correspondentes aos resultados
  const filteredCompanies = companiesData.filter((company) => {
    const nameMatch = company.name.toLowerCase().includes(searchTerm);
    const description = company.description ? company.description.toLowerCase() : '';
    const descriptionMatch = description.includes(searchTerm);
    return nameMatch || descriptionMatch;
  });

  // Exibindo os resultados na lista
  filteredCompanies.forEach((result) => {
    const listItem = document.createElement('li');
    const highlightedName = result.name.replace(new RegExp(searchTerm, 'gi'), '<mark>$&</mark>');
    const highlightedDescription = result.description.replace(new RegExp(searchTerm, 'gi'), '<mark>$&</mark>');
    listItem.innerHTML = `
      <h3>${highlightedName}</h3>
      <p>${highlightedDescription}</p>
      <hr>
    `;
  
    resultsList.appendChild(listItem);
  });
}


// Carregando os dados das empresas ao iniciar a página
loadCompaniesData();
