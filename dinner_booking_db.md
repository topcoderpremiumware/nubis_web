# DataBase

### Users (Адміни)
- id
- first_name
- last_name
- email
- password
- language

### Roles
- id
- title (role name)

### Role_User
- user_id
- role_id

### Places
- id
- name
- address
- city
- zip_code
- phone
- email
- home_page

### Place_User
- user_id
- place_id

### Tableplans (Плани розміщення столів)
- id
- name (template name)
- place_id
- data (json of table plan, зберігає згенеровані QR коди столів)
    - number
    - priority
    - seats
    - group
    - group_priority
    - color
    - angle
    - is_internal
    - is_online

### Timetables (Розклад роботи закладу з прив'язкою до плану столів)
- id
- place_id
- tableplan_id (nullable)
- area_id
- start_date (2022-02-02 з якого числа) (nullable)
- end_date (2022-02-02 по яке число) (nullable)
- start_time (09:00:00 робочий день з)
- end_time (18:00:00 робочий день по)
- length (стандартний час резервування в хвилинах)
- max (максимальна кількість людей замовлення)
- min (мінімальна кількість людей замовлення)
- week_days (масив id днів тиждня 0 - неділя, 6 - субота) (nullable)
- status (working/non-working day)

### Areas
- id
- place_id
- name

### Customers
- id
- first_name
- last_name
- phone
- email
- zip_code
- password
- allow_send_email
- language

### Orders
- id
- customer_id (nullable)
- place_id
- tableplan_id
- table_ids (ід столу на плані tableplans)
- seats (кількість замовлених місць)
- reservation_time (2022-01-01 17:00:00)
- area_id
- comment
- status
- is_take_away
- source (online/internal)
- marks (json якісь помітки)
- deleted_at

### Menus
- id
- place_id
- name

### Dishes
- id
- name

### Dish_Menu
- menu_id
- dish_id

### Message_templates
- id
- place_id
- purpose (повинен бути якийсь певний набір цілей відсилати листи)
- subject
- text
- language

### Giftcards
- id
- place_id
- name
- expired_at
- initial_amount
- spend_amount
- code

### Coupons
- id
- place_id
- name
- expired_at
- amount
- code

### Settings
- id
- place_id
- name
- value

### Feedbacks
- id
- place_id
- customer_id
- order_id
- comment
- status
- food_mark (double(3,1))
- service_mark
- ambiance_mark
- experience_mark
- is_recommend
- price_mark
- average_mark

### Files
- id
- place_id
- purpose
- filename

### Logs
- id
- user_id
- action
- comment
- ip
