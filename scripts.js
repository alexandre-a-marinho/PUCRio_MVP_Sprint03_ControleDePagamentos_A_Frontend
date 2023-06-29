/*
  --------------------------------------------------------------------------------------
  Função para obter a lista de pagamentos existentes do banco do servidor, via requisição GET
  --------------------------------------------------------------------------------------
*/
const getLista = async () => {
  let url = 'http://127.0.0.1:5000/pagamentos';
  await fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.pagamentos.forEach(item => inserirItemInterface(item.id, item.description, item.category,
                                                           item.subcategory, item.value, item.num_parcelas,
                                                           item.data_insercao));
      conectarFuncoesDeRemocaoAosBotoes();
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  atualizarSomaPagamentos();
}


/*
  --------------------------------------------------------------------------------------
  Função para atualizar a soma dos valores dos pagamentos, via requisição GET
  --------------------------------------------------------------------------------------
*/
const atualizarSomaPagamentos = async () => {
  let url = 'http://127.0.0.1:5000/soma_pagamentos';
  fetch(url, {
    method: 'get'
  })
    .then((response) => response.json())
    .then((data) => {
      let soma_pagamentos = document.getElementById('payments-sum');
      soma_pagamentos.textContent = data.soma_pagamentos.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função para limpar o formulário de inserção de novo pagamento
  --------------------------------------------------------------------------------------
*/
const limparFormulario = () => {
  document.getElementById("newDescription").value = "";
  document.getElementById("newCategory").value = "";
  document.getElementById("newSubcategory").value = "";
  document.getElementById("newValue").value = "";
  document.getElementById("newNbInstallments").value = "";
}


/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial da tabela de pagamentos da interface
  --------------------------------------------------------------------------------------
*/
getLista();

/*
  --------------------------------------------------------------------------------------
  Função para inserir novo pagamento, primeiro na interface
  (com inserirItemInterface()), e depois no banco do servidor (com postItem())
  --------------------------------------------------------------------------------------
*/
const newItem = async () => {
  let input_description = document.getElementById("newDescription").value;
  let input_category = document.getElementById("newCategory").value;
  let input_subcategory = document.getElementById("newSubcategory").value;
  let input_value = document.getElementById("newValue").value;
  let input_num_parcelas = document.getElementById("newNbInstallments").value;

  if (input_description === '') {
    alert("Informe a 'Description' do pagamento!");
  } else if (input_value === '') {
    alert("Informe o 'Valor' do pagamento!");
  } else if (isNaN(input_value) || (isNaN(input_num_parcelas) && input_num_parcelas != '')) {
    alert("'Valor' e 'Número de parcelas' devem ser valores numéricos!");
  } else {
    if (input_num_parcelas === '') {
      input_num_parcelas = 1;
    }

    let novo_item = await postItem(input_description, input_category, input_subcategory,
                                   input_value, input_num_parcelas);
    inserirItemInterface(novo_item.id, novo_item.description, novo_item.category,
                         novo_item.subcategory, novo_item.value, novo_item.num_parcelas,
                         novo_item.data_insercao);
    conectarFuncoesDeRemocaoAosBotoes();
    atualizarSomaPagamentos();
    alert("Pagamento adicionado!");
  }
}


/*
  --------------------------------------------------------------------------------------
  Função para adicionar novo pagamento no banco do servidor, via requisição POST
  --------------------------------------------------------------------------------------
*/
const postItem = async (description, category, subcategory, value, num_parcelas) => {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('category', category);
  formData.append('subcategory', subcategory);
  formData.append('value', value);
  formData.append('num_parcelas', num_parcelas);
  let novo_pagamento = {};

  let url = 'http://127.0.0.1:5000/pagamento';
  await fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      novo_pagamento = data;
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  return novo_pagamento;
}


/*
  --------------------------------------------------------------------------------------
  Função para inserir novo pagamento na interface
  --------------------------------------------------------------------------------------
*/
const inserirItemInterface = (id, desricao, category, subcategory, 
                              value, num_parcelas, data_insercao) => {
  let table = document.getElementById('table-payments');
  let row = table.insertRow();
  const item = [id, desricao, category, subcategory,
                value, num_parcelas, data_insercao];
  const row_length = item.length;
  const Atributos = Object.freeze({
    Id: 0, 
    Desricao: 1,
    Category: 2,
    Subcategory: 3,
    Value: 4,
    NumParcelas: 5,
    DataInsercao: 6
  });

  // Insere células correspondedntes a cada atributo numa linha da tabela de
  // pagamentos da interface
  for (var nth_atributo = 0; nth_atributo < row_length; nth_atributo++) {
    var cel = row.insertCell(nth_atributo);
    const valor_atributo = item[nth_atributo];

    if (nth_atributo === Atributos.Value) {
      cel.textContent = valor_atributo.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    } else if (nth_atributo === Atributos.DataInsercao) {
      const dateObj = new Date(valor_atributo);
      const isoDateStr = dateObj.toISOString();
      const yyyyMmDd = isoDateStr.slice(0, 10).replace(/-/g, '/'); // extraindo yyyy/mm/dd
      cel.textContent = yyyyMmDd;
    } else {
      cel.textContent = valor_atributo;
    }
  }

  // Insere botão de 'remoção' no fim de cada linha da tabela de pagamentos
  // da interface
  inserirBotaoRemoverItem(row.insertCell(-1));
  limparFormulario();
}


/*
  --------------------------------------------------------------------------------------
  Função para criar um botão 'remover' em cada linha da tabela de pagamentos
  da interface
  --------------------------------------------------------------------------------------
*/
const inserirBotaoRemoverItem = (parent) => {
  let img = document.createElement("img");
  img.className = "bt-delete";
  img.src = "./img/delete.png";
  parent.appendChild(img);
}


/*
  --------------------------------------------------------------------------------------
  Cria função para remover pagamento e a conecta a cada botão 'remover'
  da interface
  --------------------------------------------------------------------------------------
*/
const conectarFuncoesDeRemocaoAosBotoes = () => {
  let bts_remover = document.getElementsByClassName("bt-delete");
  let i;
  for (i = 0; i < bts_remover.length; i++) {
    bts_remover[i].onclick = function () {
      let div = this.parentElement.parentElement;
      const item_id = div.getElementsByTagName('td')[0].innerHTML;
      if (confirm("Você tem certeza?")) {
        div.remove();
        removeItem(item_id);
        alert("Removido!");
        atualizarSomaPagamentos();
      }
    }
  }
}


/*
  --------------------------------------------------------------------------------------
  Função para remover um pagamento do banco do servidor, via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const removeItem = (item_id) => {
  console.log(item_id);
  let url = 'http://127.0.0.1:5000/pagamento?id=' + item_id;
  fetch(url, {
    method: 'delete'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}
