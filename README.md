# Expense Creator Application

- This is an basic expense create application in which user can Create/Update/Delete there expenses
- Attached is the Structure diagram for the application
- The complete application is dockerized
- For this the user should register to the application with email and password
- Once user is registered , then only they can create/update/delete the expenses by using the JWT which user gets during login and Account Signup

## Installation

The expense tracker consist of docker-compose file which is used for running the application
This helps in running all the services required for this application which includes

- App 1 : Main Nodejs/Express application 
- App 2 : Secondary Nodejs/Express application
- Redis : Used as queue services by using pub/sub module
- MongoDB : Persistant data storage 


For running the application
```bash
docker-componse up --build
```

For running the application in the background without building
```bash
docker-componse up -d
```

For Stopping the application
```bash
Ctrl + C
```

## Usage

```python
App 1 port: 8001
App 2 port: 8002
Mongo : 27017
Redis: 6379
```
## Development Environment

- Docker installed on system
- VSCode
- Extension of VSCode : RestClient ( for sending request)


## Project overview

- The Project consist of 2 application
- APP 1 and APP 2 which are both Nodejs/Express application
- All the rest apis are provided under **request.http** for each application APP 1 and APP 2
- The user have to register to the application (**APP 1**) by providing Email, password, firstName and lastName
- Once the user register to the application, the unique **access token** is granted for  other apis related to expense
- This is being done to safegaurd any unauthorised access to client data and his expenses
- Once user recieves the **access token** , this token is then used for below application apis
  - Creating Expenses 
  - Updating Expenses 
  - Deleting Expenses
- The user can create expenses by providing the title, amount, description, date and type of expense (**income/expense**)
- Once the user creates the expense, the data gets **publish to the redis queue** with different channels
- Then APP 1 and APP 2 being both the **subcriber to the redis queue** get the message from the user event for each channel
- This then get inserted into particular instance of mongodb for APP 1 and APP 2
- There is seperate access provided for the both the application to fetch the user expense, using the paginated apis


