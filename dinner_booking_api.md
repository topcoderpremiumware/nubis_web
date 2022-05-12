# API
## Auth
#### Register
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/register \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-d '{"first_name":"Max","last_name":"Nic","email":"2ovob4ehko@ukr.net","password":"Maxlibra85","password_confirmation":"Maxlibra85"}'
```
#### Login
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/login \
-H "X-Requested-With: XMLHttpRequest" \
-H 'Content-Type: application/json' \
-d '{"email":"2ovob4ehko@ukr.net","password":"Maxlibra85"}'
```
#### Get user
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/user \
-H "X-Requested-With: XMLHttpRequest" \
-H "Accept: application/json" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f"
```
#### Logout
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/logout \
-H "X-Requested-With: XMLHttpRequest" \
-H "Accept: application/json" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f"
```
---
## Places
#### Create
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/places \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"name":"McDonalds","address":"Shevchenka 200","city":"Cherkasy","zip_code":"18000","phone":"","email":"","home_page":""}'
```
#### Get all
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/places \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
#### Get one
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/places/1 \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json'
```
---
## Settings
#### Save
```cmd
curl -X POST https://dinner-book.vasilkoff.info/api/settings \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"name":"default_seats","value":"2"}'
```
#### Get
```cmd
curl -X GET https://dinner-book.vasilkoff.info/api/settings \
-H "X-Requested-With: XMLHttpRequest" \
-H "Authorization: Bearer 2|94t8eMykhvSrvKaNg1obqLNaexYF2ZZ71p1m0K8f" \
-H 'Content-Type: application/json' \
-d '{"place_id":1,"name":"default_seats"}'
```
