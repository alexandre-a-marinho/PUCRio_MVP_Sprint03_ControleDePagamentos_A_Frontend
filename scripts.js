/*
  --------------------------------------------------------------------------------------
  Global Variables
  --------------------------------------------------------------------------------------
*/
let exchange_rate;


/*
  --------------------------------------------------------------------------------------
  Function to obtain the list of existing payments from the server database, via GET request
  --------------------------------------------------------------------------------------
*/
const getList = async () => {
  await updateExchangeRate();

  let url = 'http://127.0.0.1:5000/payments';
  await fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.payments.forEach(item => insertItemInterface(item.id, item.description, item.category,
                                                        item.subcategory, item.value, item.nb_installments,
                                                        item.insertion_date));
      connectDeleteFunctionsToButtons();
      connectEditFunctionsToButtons();
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  updatePaymentsSum();
}


/*
  --------------------------------------------------------------------------------------
  Function to update the sum of payment values, via GET request
  --------------------------------------------------------------------------------------
*/
const updatePaymentsSum = async () => {
  let url = 'http://127.0.0.1:5000/payments_sum';
  fetch(url, {
    method: 'get'
  })
    .then((response) => response.json())
    .then((data) => {
      let payments_sum = document.getElementById('payments-sum');
      payments_sum.textContent = data.payments_sum.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Function to clear the "new payment" insertion form
  --------------------------------------------------------------------------------------
*/
const cleanForm = () => {
  document.getElementById("newDescription").value = "";
  document.getElementById("newCategory").value = "";
  document.getElementById("newSubcategory").value = "";
  document.getElementById("newValue").value = "";
  document.getElementById("newNbInstallments").value = "";
}


/*
  --------------------------------------------------------------------------------------
  Function update currency exchange rate
  --------------------------------------------------------------------------------------
*/
const updateExchangeRate = async () => {
  let exchangerates_api_key = "2e3a54fcfa6f2b4bfd89d5ade4b20227";

  const url = 'http://api.exchangeratesapi.io/v1/latest?access_key=' + exchangerates_api_key;
  await fetch(url, {
    method: 'get'
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.rates) {
        const exchange_rate_eur_brl = data.rates.BRL;
        const exchange_rate_eur_usd = data.rates.USD;
        exchange_rate = (1 / exchange_rate_eur_brl) * exchange_rate_eur_usd;
      } else if (data.error.code === "https_access_restricted") {
        alert(data.error.message);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Function to insert new payment, first in the interface
  (with insertItemInterface()), and then on the server bank (with postItem())
  --------------------------------------------------------------------------------------
*/
const newItem = async () => {
  await updateExchangeRate();

  let input_description = document.getElementById("newDescription").value;
  let input_category = document.getElementById("newCategory").value;
  let input_subcategory = document.getElementById("newSubcategory").value;
  let input_value = document.getElementById("newValue").value;
  let input_nb_installments = document.getElementById("newNbInstallments").value;

  if (input_description === '') {
    alert("Payment 'Description' field is mandatory!");
  } else if (input_value === '') {
    alert("Payment 'Value' field is mandatory!");
  } else if (isNaN(input_value) || (isNaN(input_nb_installments) && input_nb_installments != '')) {
    alert("'Value' e 'Number of installments' fields accept only numeric values!");
  } else {
    if (input_nb_installments === '') {
      input_nb_installments = 1;
    }

    let new_item = await postItem(input_description, input_category, input_subcategory,
                                  input_value, input_nb_installments);
    insertItemInterface(new_item.id, new_item.description, new_item.category,
                        new_item.subcategory, new_item.value, new_item.nb_installments,
                        new_item.insertion_date);
    connectDeleteFunctionsToButtons();
    connectEditFunctionsToButtons();
    updatePaymentsSum();
    alert("New payment added!");
  }
}


/*
  --------------------------------------------------------------------------------------
  Function to add new payment in the server database, via POST request
  --------------------------------------------------------------------------------------
*/
const postItem = async (description, category, subcategory, value, nb_installments) => {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('category', category);
  formData.append('subcategory', subcategory);
  formData.append('value', value);
  formData.append('nb_installments', nb_installments);
  let new_payment = {};

  let url = 'http://127.0.0.1:5000/payment';
  await fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      new_payment = data;
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  return new_payment;
}


/*
  --------------------------------------------------------------------------------------
  Function to insert new payment in the interface
  --------------------------------------------------------------------------------------
*/
const insertItemInterface = (id, description, category, subcategory, 
                             value, nb_installments, insertion_date) => {
  const exchange_value = value * exchange_rate;
  let table = document.getElementById('table-payments');
  let row = table.insertRow();
  const item = [id, description, category, subcategory,
                value, exchange_value, nb_installments, insertion_date];
  const row_data_length = item.length;
  const attributes = Object.freeze({
    Id: 1, 
    Description: 2,
    Category: 3,
    Subcategory: 4,
    Value: 5,
    Exchange_Value: 6,
    NbInstallments: 7,
    InsertionDate: 8
  });

  // Inserts 'edition' button at the beginning of each line of the UI payments table
  insertEditionItemButton(row.insertCell(0));
  
  // Inserts cells corresponding to each attribute in a row of the UI payments table
  for (var cell_idx = 1; cell_idx <= row_data_length; cell_idx++) {
    var cel = row.insertCell(cell_idx);

    // There are 10 cells/columns per row, but only 8 data values from the itens (1st cell is edition button and last cell is delete button)
    const item_idx = cell_idx - 1;
    const attribute_value = item[item_idx];

    if (cell_idx === attributes.Value) {
      cel.textContent = attribute_value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    } else if (cell_idx === attributes.Exchange_Value) {
      cel.textContent = attribute_value.toLocaleString('en-US', {style: 'currency', currency: 'USD'}); // FIXME: get correct symbols for the chosen currency, euros, dolars, etc
    } else if (cell_idx === attributes.InsertionDate) {
      const dateObj = new Date(attribute_value);
      const isoDateStr = dateObj.toISOString();
      const yyyyMmDd = isoDateStr.slice(0, 10).replace(/-/g, '/'); // extracting yyyy/mm/dd
      cel.textContent = yyyyMmDd;
    } else {
      cel.textContent = attribute_value;
    }
  }

  // Inserts 'delete' button at the end of each line of the UI payments table
  insertDeleteItemButton(row.insertCell(-1));

  cleanForm();
}


/*
  --------------------------------------------------------------------------------------
  Function to create a 'delete' button on each line of the UI payments table
  --------------------------------------------------------------------------------------
*/
const insertDeleteItemButton = (parent) => {
  let img = document.createElement("img");
  img.className = "bt-delete";
  img.src = "./img/delete.png";
  parent.appendChild(img);
}


/*
  --------------------------------------------------------------------------------------
  Function to create a 'edition' button on each line of the UI payments table
  --------------------------------------------------------------------------------------
*/
const insertEditionItemButton = (parent) => {
  let img = document.createElement("img");
  img.className = "bt-edit";
  img.src = "./img/edition.png";
  parent.appendChild(img);
}


/*
  --------------------------------------------------------------------------------------
  Create function to delete payment and connect it to each 'delete' button in the interface
  --------------------------------------------------------------------------------------
*/
const connectDeleteFunctionsToButtons = () => {
  let delete_button = document.getElementsByClassName("bt-delete");
  let i;
  for (i = 0; i < delete_button.length; i++) {
    delete_button[i].onclick = function () {
      let current_row = this.parentElement.parentElement;
      const item_id_idx = 1;
      const item_id = current_row.getElementsByTagName('td')[item_id_idx].innerHTML;
      if (confirm("Are you sure? Confirm deletion?")) {
        current_row.remove();
        deleteItem(item_id);
        alert("Payment deleted!");
        updatePaymentsSum();
      }
    }
  }
}


/*
  --------------------------------------------------------------------------------------
  Create function to edit payment and connect it to each 'edition' button in the interface
  --------------------------------------------------------------------------------------
*/
const connectEditFunctionsToButtons = () => {
  let edit_button = document.getElementsByClassName("bt-edit");
  let i;
  for (i = 0; i < edit_button.length; i++) {
    edit_button[i].onclick = function () {
      let current_row = this.parentElement.parentElement;
      const item_id_idx = 1;
      const item_id = current_row.getElementsByTagName('td')[item_id_idx].innerHTML;
      if (confirm("Do you want to edit this item?")) {
        // TODO: implement edition actions here [MVP3-7]
        alert("Payment edited!");
        updatePaymentsSum();
      }
    }
  }
}


/*
  --------------------------------------------------------------------------------------
  Function to delete a payment from the server database, via DELETE request
  --------------------------------------------------------------------------------------
*/
const deleteItem = (item_id) => {
  console.log(item_id);
  let url = 'http://127.0.0.1:5000/payment?id=' + item_id;
  fetch(url, {
    method: 'delete'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Function call for initial loading of the UI payments table
  --------------------------------------------------------------------------------------
*/
getList();
