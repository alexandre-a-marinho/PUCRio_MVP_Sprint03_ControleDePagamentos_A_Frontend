/*
  --------------------------------------------------------------------------------------
  Function to obtain the list of existing payments from the server database, via GET request
  --------------------------------------------------------------------------------------
*/
const getList = async () => {
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
  Function call for initial loading of the UI payments table
  --------------------------------------------------------------------------------------
*/
getList();


/*
  --------------------------------------------------------------------------------------
  Function to insert new payment, first in the interface
  (with insertItemInterface()), and then on the server bank (with postItem())
  --------------------------------------------------------------------------------------
*/
const newItem = async () => {
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
  let table = document.getElementById('table-payments');
  let row = table.insertRow();
  const item = [id, description, category, subcategory,
                value, nb_installments, insertion_date];
  const row_length = item.length;
  const attributes = Object.freeze({
    Id: 0, 
    Description: 1,
    Category: 2,
    Subcategory: 3,
    Value: 4,
    NbInstallments: 5,
    InsertionDate: 6
  });

  // Inserts cells corresponding to each attribute in a row of the UI payments table
  for (var nth_attribute = 0; nth_attribute < row_length; nth_attribute++) {
    var cel = row.insertCell(nth_attribute);
    const attribute_value = item[nth_attribute];

    if (nth_attribute === attributes.Value) {
      cel.textContent = attribute_value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    } else if (nth_attribute === attributes.InsertionDate) {
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
  Create function to delete payment and connect it to each 'delete' button in the interface
  --------------------------------------------------------------------------------------
*/
const connectDeleteFunctionsToButtons = () => {
  let delete_button = document.getElementsByClassName("bt-delete");
  let i;
  for (i = 0; i < delete_button.length; i++) {
    delete_button[i].onclick = function () {
      let div = this.parentElement.parentElement;
      const item_id = div.getElementsByTagName('td')[0].innerHTML;
      if (confirm("Are you sure? Confirm deletion?")) {
        div.remove();
        deleteItem(item_id);
        alert("Payment deleted!");
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
