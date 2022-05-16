# API
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
-d '{"roles":"[1]"}'
```
---
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
#### Get one (with tableplans)
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
---
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
#### Save place
> POST /api/tableplans/{id}
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/tableplans/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"name":"Tableplan 1","place_id":1,"data":[{"number":1,"priority":1,"seats":2,"group":1,"group_priority":1,"color":"#ff0000","angle":90,"top":50,"left":40,"type":0,"is_internal":true,"is_online":true,"qr_code":""}]}'
```
