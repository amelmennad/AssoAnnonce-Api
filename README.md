# Assoannonce Project - Backend

## Environment Variables

To run this project, you will need one files dev.env  
For this, you copy `default.env` inside config folder rename to dev.env and adapt values

## Run Locally

Clone the project

```bash
  git clone https://link-to-project
```

Go to the project directory

```bash
  cd assoannonce-backend
```

Install dependencies

```bash
  npm install
```

Build project

```bash
npx tsc --watch
```

Start the server

```bash
npm run dev
```

## Running Tests

```bash
  npm run test
```


## API Reference
### Volunteer
#### Register 
```http
  POST /api/volunteer/register
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `firstName` | `string` | **Required**. Volunteer first name |
| `lastName` | `string` | **Required**. Volunteer last name |
| `email` | `string` | **Required**. Volunteer email |
| `password` | `string` | **Required**. Volunteer password with 8 characters minimum : 1 uppercase, 1 lowercase, 1 number, 1 special character |
| `birthday` | `string` | **Required**. Volunteer birthday front formatting |
| `salt` | `string` | **Required**. Automatic generation |
| `token` | `string` | **Required**. Automatic generation |

_Return_   : Id and token

#### Login 
```http
  POST /api/volunteer/login
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Volunteer email |
| `password` | `string` | **Required**. Volunteer password  |

_Return_   : Id and token


#### Profil 
```http
  Get /api/volunteer/profil
```

| Headers.authorization | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `bearerToken` | `string` | **Required**. Token inside cookie |

_Return_  : 
|  | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `firstName` | `string` | Volunteer first name |
| `lastName` | `string` | Volunteer last name |
| `email` | `string` |  Volunteer email |
| `birthday` | `string` |  Volunteer birthday|
| `aboutMe` | `string` | Volunteer description aboutme creta with profile update |
| `avatar` | `string` |  Volunteer avatar, picture add with profile update  |
