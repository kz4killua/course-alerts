# Course Alerts
Course Alerts is a web application that monitors class availability at [Ontario Tech University](https://ontariotechu.ca/) and sends text and email notifications when seats become available in previously full classes. The application is live at https://www.coursealerts.fyi. 

## Running Locally
Students at Ontario Tech University can use the application (for free!) at [coursealerts.fyi](https://www.coursealerts.fyi). However, if you want to run the application locally, you'll need to clone this repository and setup both the backend and the frontend. 

### Running the Backend
The backend application is built with [Django](https://www.djangoproject.com/). Follow these steps to set up and run the backend:
1. Make sure [Python 3](https://www.python.org/) is installed on your machine. The backend was written using Python 3.11.1. 
2. Navigate to the `backend` directory in your terminal.
3. Create a `.env` file in this directory and populate it with the needed environment variables. (See `backend/.env.example`.)
4. Install the project requirements using the following command: `pip install -r requirements.txt`. (It is recommended to first create and activate a [virtual environment](https://docs.python.org/3/library/venv.html) for this.)
5. Run `python manage.py migrate` to set up the project database.
6. Finally, run `python manage.py runserver` to start the backend application. By default, this will run on port 8000 and can be accessed at `localhost:8000`.

#### With Docker
Alternatively, you can run the backend using Docker. To do this: 
1. Make sure [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) are installed on your machine.
2. Navigate to the `backend` directory in your terminal.
3. Create a `.env` file in this directory and populate it with the necessary environment variables. (See`backend/.env.example`.)
4. Run `docker compose build` to build the Docker image.
5. Run `docker compose up` to start the application. By default, this will run on port 8000 and can be accessed at `localhost:8000`.

### Running the Frontend
The frontend application is built with [Next.js](https://nextjs.org/). Follow these steps to set up and run the frontend: 
1. Make sure [Node.js](https://nodejs.org/en/download/package-manager) is installed on your machine. 
2. Navigate to the `frontend` directory in your terminal.
3. Install dependencies by running `npm install`.
4. Create up a `.env.local` file in this directory and populate it with the needed environment variables. (See `frontend/.env.example`.)
5. Run `npm run dev` to start a development server. 
