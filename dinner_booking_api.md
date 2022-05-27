# API

---
- [Auth](#auth)
- [Places](#places)
- [Settings](#settings)
- [Roles](#roles)
- [Tableplans](#tableplans)
- [Areas](#areas)
- [Timetables](#timetables)
- [Customers](#customers)
- [Orders](#orders)
- [Dishes](#dishes)
- [Menus](#menus)
- [Message templates](#message_templates)
- [Giftcards](#giftcards)
- [Coupons](#coupons)
- [Feedbacks](#feedbacks)
- [Files](#files)

---
<a id="auth"></a>
## Auth
#### Register
> POST /api/register
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/register \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-d '{"first_name":"Max","last_name":"Nic","email":"2ovob4ehko@ukr.net","password":"Maxlibra85","password_confirmation":"Maxlibra85","language":"en"}'
```
#### Login
> POST /api/login
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/login \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-d '{"email":"2ovob4ehko@ukr.net","password":"Maxlibra85"}'
```
#### Get user
> GET /api/user
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/user \
-H "X-Requested-With: XMLHttpRequest" \
-H "Accept: application/json" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f"
```
#### Logout
> POST /api/logout
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/logout \
-H "X-Requested-With: XMLHttpRequest" \
-H "Accept: application/json" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f"
```
#### Save user
> POST /api/user
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/user \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-d '{"first_name":"Max","last_name":"Nic","email":"2ovob4ehko@ukr.net","language":"en"}'
```
#### Change user language
> POST /api/user/language
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/user/language \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-d '{"language":"en"}'
```
#### Change user password
> POST /api/user/password
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/user/password \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-d '{"password":"Maxlibra85","password_confirmation":"Maxlibra85"}'
```
#### Set user roles
> POST /api/user/{id}/roles
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/user/1/roles \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-d '{"roles":[1]}'
```
#### Get user roles
> GET /api/user/{id}/roles
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/user/1/roles \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f"
```
---
<a id="places"></a>
## Places
#### Create
> POST /api/places
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/places \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"name":"McDonalds","address":"Shevchenka 200","city":"Cherkasy","zip_code":"18000","phone":"","email":"","home_page":""}'
```
#### Get all
> GET /api/places
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/places \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Get all that belongs to the user
> GET /api/places/mine
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/places/mine \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Get one
> GET /api/places/{id}
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/places/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Save place
> POST /api/places/{id}
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/places/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"name":"McDonalds","address":"Shevchenka 200","city":"Cherkasy","zip_code":"18000","phone":"","email":"","home_page":""}'
```
#### Get all areas of place
> GET /api/places/{id}/areas
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/places/1/areas \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Get all menus of place
> GET /api/places/{id}/menus
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/places/1/menus \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
---
<a id="settings"></a>
## Settings
#### Save
> POST /api/settings
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/settings \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"name":"default_seats","value":"2"}'
```
#### Get
> GET /api/settings
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/settings \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"name":"default_seats"}'
```
---
## Roles
#### Create
> POST /api/roles
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/roles \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"title":"admin"}'
```
#### Get all
> GET /api/roles
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/roles \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
---
## Tableplans
#### Create
> POST /api/tableplans
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/tableplans \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"name":"Tableplan 1","place_id":1,"data":[{"number":1,"priority":1,"seats":2,"group":1,"group_priority":1,"color":"#ff0000","angle":90,"top":50,"left":40,"type":0,"is_internal":true,"is_online":true,"qr_code":""}]}'
```
#### Get one
> GET /api/tableplans/{id}
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/tableplans/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Save
> POST /api/tableplans/{id}
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/tableplans/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"name":"Tableplan 1","place_id":1,"data":[{"number":1,"priority":1,"seats":2,"group":1,"group_priority":1,"color":"#ff0000","angle":90,"top":50,"left":40,"type":0,"is_internal":true,"is_online":true,"qr_code":""}]}'
```
---
<a id="areas"></a>
## Areas
#### Create
> POST /api/areas
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/areas \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"name":"Area 1","place_id":1}'
```
#### Get one
> GET /api/areas/{id}
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/areas/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Save
> POST /api/areas/{id}
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/areas/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"name":"Area 1","place_id":1}'
```
#### Get working time by area and date
> GET /api/areas/{id}/working
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/areas/1/working \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"date":"2022-05-18"}'
```
---
<a id="timetables"></a>
## Timetables
#### Create
> POST /api/timetables
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/timetables \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"tableplan_id":1,"area_id":1,"start_date":"2022-01-01","end_date":"2032-01-01","start_time":"09:00:00","end_time":"18:00:00","length":420,"max":50,"min":1,"week_days":[1,2,3,4,5],"status":"working"}'
```
#### Get one
> GET /api/timetables/{id}
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/timetables/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Save
> POST /api/timetables/{id}
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/timetables/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"tableplan_id":1,"area_id":1,"start_date":"2022-01-01","end_date":"2032-01-01","start_time":"09:00:00","end_time":"18:00:00","length":420,"max":50,"min":1,"week_days":[1,2,3,4,5],"status":"working"}'
```
---
<a id="customers"></a>
## Customers
#### Register
> POST /api/customers/register
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/customers/register \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-d '{"first_name":"Mary","last_name":"Nic","email":"2ovob4ehko@ukr.net","phone":"","zip_code":"","password":"MaxLibra85","password_confirmation":"MaxLibra85","language":"en","allow_send_emails":true,"allow_send_news":false}'
```
#### Login
> POST /api/customers/login
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/customers/login \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-d '{"email":"2ovob4ehko@ukr.net","password":"Maxlibra85"}'
```
#### Get customer data
> GET /api/customers
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/customers \
-H "X-Requested-With: XMLHttpRequest" \
-H "Accept: application/json" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f"
```
#### Logout
> POST /api/customers/logout
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/customers/logout \
-H "X-Requested-With: XMLHttpRequest" \
-H "Accept: application/json" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f"
```
#### Save
> POST /api/customers
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/customers \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-d '{"first_name":"Max","last_name":"Nic","email":"2ovob4ehko@ukr.net","language":"en"}'
```
#### Change customer language
> POST /api/customers/language
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/customers/language \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-d '{"language":"en"}'
```
#### Change customer password
> POST /api/customers/password
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/customers/password \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-d '{"password":"Maxlibra85","password_confirmation":"Maxlibra85"}'
```
#### Get all orders of customer
> GET /api/customers/orders
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/customers/orders \
-H "X-Requested-With: XMLHttpRequest" \
-H "Accept: application/json" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f"
```
---
<a id="orders"></a>
## Orders
#### Create
> POST /api/orders
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/orders \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"customer_id":1,"place_id":1,"tableplan_id":1,"area_id":1,"table_ids":[1],"seats":2,"reservation_time":"2022-05-18 12:00:00","comment":"","status":"waiting","is_take_away":0,"source":"online","marks": ""}'
```
#### Get one
> GET /api/orders/{id}
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/orders/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Save
> POST /api/orders/{id}
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/orders/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"customer_id":1,"place_id":1,"tableplan_id":1,"area_id":1,"table_ids":[1],"seats":2,"reservation_time":"2022-05-18 12:00:00","comment":"","status":"waiting","is_take_away":0,"source":"online","marks": ""}'
```
#### Get orders by selected place, area and time period
> GET /api/orders
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/orders \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"area_id":1,"reservation_from":"2022-05-18 09:00:00","reservation_to":"2022-05-18 18:00:00"}'
```
#### Delete
> DELETE /api/orders/{id}
```cmd
curl -X DELETE https://dinner-book.vasilkoff.info/api/orders/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Change status
> POST /api/orders/{id}/status
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/orders/1/status \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"status":"waiting"}'
```
---
<a id="dishes"></a>
## Dishes
#### Create
> POST /api/dishes
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/dishes \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"name":"Dish 1"}'
```
#### Get one
> GET /api/dishes/{id}
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/dishes/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Save
> POST /api/dishes/{id}
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/dishes/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"name":"Dish 1"}'
```
#### Get all
> GET /api/dishes
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/dishes \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
---
<a id="menus"></a>
## Menus
#### Create
> POST /api/menus
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/menus \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"name":"Menu 1","place_id":1}'
```
#### Get one
> GET /api/menus/{id}
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/menus/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Save
> POST /api/menus/{id}
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/menus/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"name":"Menu 1","place_id":1}'
```
#### Set menu dishes
> POST /api/menus/{id}/dishes
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/menus/1/dishes \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-d '{"dishes":[1,2,3]}'
```
---
<a id="message_templates"></a>
## Message templates
#### Create
> POST /api/message_tempates
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/message_tempates \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"purpose":"welcome","subject":"Hello","text":"Hello, [[NAME]]","language":"en"}'
```
#### Get one
> GET /api/message_tempates/{id}
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/message_tempates/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Save
> POST /api/message_tempates/{id}
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/message_tempates/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"purpose":"welcome","subject":"Hello","text":"Hello, [[NAME]]","language":"en"}'
```
#### Get all
> GET /api/message_tempates
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/message_tempates \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1}'
```
---
<a id="giftcards"></a>
## Giftcards
#### Create
> POST /api/giftcards
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/giftcards \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"name":"Max","expired_at":"2022-02-02 12:00:00","initial_amount":100,"spend_amount":0}'
```
#### Get one
> GET /api/giftcards/{id}
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/giftcards/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Save
> POST /api/giftcards/{id}
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/giftcards/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"name":"Max","expired_at":"2022-02-02 12:00:00","initial_amount":100,"spend_amount":50}'
```
#### Get all
> GET /api/giftcards
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/giftcards \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1}'
```
#### Get by code
> GET /api/giftcards_check
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/giftcards_check \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"code":"dfhdfh"}'
```
#### Spend
> POST /api/giftcards_spend
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/giftcards_spend \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"code":"dfhdfh","amount":30}'
```
---
<a id="coupons"></a>
## Coupons
#### Create
> POST /api/coupons
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/coupons \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"name":"Max","expired_at":"2022-02-02 12:00:00","amount":100}'
```
#### Get one
> GET /api/coupons/{id}
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/coupons/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Save
> POST /api/coupons/{id}
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/coupons/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"name":"Max","expired_at":"2022-02-02 12:00:00","amount":100}'
```
#### Get all
> GET /api/coupons
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/coupons \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1}'
```
#### Get by code
> GET /api/coupons_check
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/coupons_check \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"code":"dfhdfh"}'
```
#### Delete
> DELETE /api/coupons/{id}
```cmd
curl -X DELETE https://dinner-book.vasilkoff.info/api/coupons/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
---
<a id="feedbacks"></a>
## Feedbacks
#### Create
> POST /api/feedbacks
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/feedbacks \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"customer_id":1,"place_id":1,"order_id":1,"comment":"Good food","status":"public","food_mark":5.0,"service_mark":5.0,"ambiance_mark":5.0,"experience_mark":5.0,"price_mark":5.0,"is_recommend":1}'
```
#### Get one
> GET /api/feedbacks/{id}
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/feedbacks/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Save
> POST /api/feedbacks/{id}
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/feedbacks/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"customer_id":1,"place_id":1,"order_id":1,"comment":"Good food","status":"public","food_mark":5.0,"service_mark":5.0,"ambiance_mark":5.0,"experience_mark":5.0,"price_mark":5.0,"is_recommend":1}'
```
#### Get all
> GET /api/feedbacks
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/feedbacks \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1}'
```
#### Get all public
> GET /api/feedbacks_public
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/feedbacks_public \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1}'
```
---
<a id="files"></a>
## Files
#### Create
> POST /api/files
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/files \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-F "place_id=1" \
-F "perpose=logo" \
-F "file=@logo.png"
```
#### Get one
> GET /api/files/{id}
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/files/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Save
> POST /api/files/{id}
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/files/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-F "place_id=1" \
-F "perpose=logo" \
-F "file=@logo.png"
```
#### Get all
> GET /api/files
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/files \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1}'
```
#### Get file by perpose
> GET /api/files_perpose
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/files_perpose \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"perpose":"logo"}'
```
