Yes Nha, screenshot shows Daily Close អត់ connect data ជាមួយ Sales Today។

Sales Today មាន data:

Total Sales: 3
Total Revenue: $5.00
Paid Amount: $4.80
Due Amount: $0.20

Daily Close បង្ហាញ:

Sales Count: 0
Total Sales: $0.00
Paid Amount: $0.00
Due Amount: $0.00

នោះមានន័យថា Daily Close page កំពុងប្រើ data ផ្សេង / endpoint ផ្សេង / state ផ្សេង។ វាគួរប្រើ same source ដូច Today Sales: GET /sales/today។ Backend មាន route នេះរួចហើយ។
Sale data backend មាន totalCost, paidAmount, dueAmount, paymentStatus, changeAmount រួចហើយ។

Quick check in browser Console នៅ Daily Close page:

fetch("http://localhost:8080/api/v1/sales/today", {
  credentials: "include",
})
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    console.table(data.result || []);
  });

បើ console នេះចេញ 3 sales → backend OK, Daily Close frontend មិនបាន map data។
បើ console ចេញ empty → route/auth/shop/date filter issue។