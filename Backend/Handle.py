from flask import Flask, request

app = Flask(__name__)


@app.route('/login', methods=['POST'])
def login():
    # Get the login credentials from the request
    credentials = request.get_json()
    username = credentials['username']
    password = credentials['password']

    # Validate the login credentials
    if username == 'admin' and password == 'secret':
        # Return a success message if the login is successful
        return 'Login successful', 200
    else:
        # Return an error message if the login is unsuccessful
        return 'Invalid login credentials', 401