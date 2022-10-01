# Author: Prof. MM Ghassemi <ghassem3@msu.edu>
from flask import current_app as app
from flask import render_template, redirect, request, session, url_for, copy_current_request_context
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect
from .utils.database.database  import database
from werkzeug.datastructures   import ImmutableMultiDict
from pprint import pprint
import json
import random
import http.client
import functools
from . import socketio
from datetime import datetime, date, timedelta
import logging
db = database()


#######################################################################################
# AUTHENTICATION RELATED
#######################################################################################
def login_required(func):
    @functools.wraps(func)
    def secure_function(*args, **kwargs):
        if "email" not in session:
            return redirect(url_for("login", next=request.url))
        return func(*args, **kwargs)
    return secure_function

def getUser():
	return session['email'] if 'email' in session else 'Unknown'

def getUserRole():
	user = getUser()
	roleQuery = "SELECT role FROM users WHERE email ='{}'".format(user)
	role = db.query(roleQuery)
	if (len(role) > 0):
		return role[0]["role"]
	else:
		return None

@app.route('/login')
def login():
	print("GetUser():", getUser())
	return render_template('login.html', user=getUser())

@app.route('/newLogin')
def newLogin():
	return render_template('newLogin.html')

@app.route('/logout')
def logout():
	session.pop('email', default=None)
	return redirect('/')

@app.route('/processlogin', methods = ["POST","GET"])
def processlogin():
	form_fields = dict((key, request.form.getlist(key)[0]) for key in list(request.form.keys()))
	# check if email exists in database (authenticate)
	# if authenticate returns 1, success else don't authenticate (success: 0)
	result = db.authenticate(form_fields["email"], form_fields["password"])
	if (result["success"] == 1):
		session['email'] = form_fields['email']
		return json.dumps({'success':1})
	else:
		# login not authenticated
		session['email'] = 'Unknown'
		return json.dumps({'success':0})



@app.route('/signUp')
def signUp():
	return render_template('signup.html', user=getUser())

@app.route('/processSignUp', methods = ["POST", "GET"])
def processSignUp():
	form_data = dict((key, request.form.getlist(key)[0]) for key in list(request.form.keys()))

	if (form_data != {}):
		email, password, confirm = form_data["email"], form_data["password"], form_data["confirmPassword"]

		# check if passswords equal
		if (password != confirm):
			return json.dumps({"success":0})


		# check if email already exists in database
		query = db.query("SELECT email FROM users WHERE email ='{}'".format(email))
		if (query):
			return json.dumps({"success":-1})

		#args = [form_data["email"], form_data["password"], form_data["confirmPassword"]]
		# encrypt and store in database
		args = ["guest", email, db.onewayEncrypt(password), "YES"]
		db.insertRows("users", ["role", "email", "password", "first_wordle"], [args])


	return json.dumps({"success":1})



#######################################################################################
# CHATROOM RELATED
#######################################################################################
@app.route('/chat')
@login_required
def chat():
    return render_template('chat.html', user=getUser())

@socketio.on('joined', namespace='/chat')
def joined(message):
	join_room('main')
	role = getUserRole()

	if (role):
		if (role == "owner"):
			emit('status', {'msg': getUser() + ' has entered the room.', 'style': 'width: 100%;color:blue;text-align: right'}, room='main')
		else:
		    emit('status', {'msg': getUser() + ' has entered the room.', 'style': 'width: 100%;color:grey;text-align: left'}, room='main')

@socketio.on('send_message', namespace='/chat')
def send_message(message):
	role = getUserRole()

	if (role):
		# if owner 
		if (role == "owner"):
			emit('received-message', {'msg': message, 'style': 'width: 100%;color:blue;text-align: right'}, room='main')
		else:
			emit('received-message', {'msg': message, 'style': 'width: 100%;color:grey;text-align: left'}, room='main')

	else:
		return

@socketio.on("left", namespace="/chat")
def left(message):
	username = getUser()
	role = getUserRole()

	if (role):
		if (role == "owner"):
			leave_room("main")
			emit("status", {'msg': getUser() + ' has left the room.', 'style': 'width: 100%;color:blue;text-align: right'}, room='main')
		else:
			leave_room("main")
			emit("status", {'msg': getUser() + ' has left the room.', 'style': 'width: 100%;color:grey;text-align: left'}, room='main')

#######################################################################################
# OTHER
#######################################################################################
@app.route('/')
def root():
	wordOfDay()
	return redirect('/home')

@app.route('/home')
def home():
	wordOfDay()
	print("home")
	return render_template('home.html', user=getUser())

@app.route("/static/<path:path>")
def static_dir(path):
    return send_from_directory("static", path)

@app.route('/projects')
def projects():
	return render_template("projects.html", user=getUser())

@app.route('/resume')
def resume():
	resume_data = db.getResumeData()
	pprint(resume_data)
	return render_template('resume.html', resume_data = resume_data, user=getUser())

@app.route('/piano')
def piano():
	return render_template("piano.html", user=getUser())

@app.route("/processWordle", methods=["GET"])
def processWordle():
	word = wordOfDay()
	return json.dumps({"word": word})

@app.route('/playlist')
def playlist():
	print("Spotify Time!")
	return render_template('playlist.html', user=getUser())

@app.route("/wordle")
@login_required
def wordle():
	logging.warning("/Wordle")
	query = "SELECT email, first_wordle FROM users WHERE email ='{}'".format(getUser())
	res = db.query(query)

	print(db.query("SELECT * FROM leaderboard"))
	word = wordOfDay()

	query2 = "SELECT email FROM leaderboard WHERE email = '{}'".format(getUser())
	leaderboard = db.query(query2)
	print("leaderboard")

	if (not leaderboard):
		logging.warning("first time logging in today")

		print("first time logging in today")
		now = datetime.now()
		curr_time = now.strftime("%H:%M:%S")
		print(curr_time)
		args = [getUser(), curr_time]
		db.insertRows("leaderboard", ["email", "start_time"], [args])
		logging.warning(db.query("SELECT * FROM leaderboard"))



	query3 = "SELECT score FROM leaderboard WHERE email = '{}'".format(getUser())
	score = db.query(query3)
	score = score[0]["score"] if score else []

	# get top 5 users
	topFive = db.query("SELECT email, score FROM leaderboard WHERE score > 0 ORDER BY score DESC LIMIT 5")
	print(topFive)

	return render_template("wordle.html", user=getUser(), first_wordle=res[0]["first_wordle"], score=score, topFive=topFive, hiddenWord=word)

@app.route("/processLeaderboard", methods=["POST"])
def processLeaderboard():
	logging.warning("process leaderboard")

	print("PROCESSING leaderboard")
	form_data = request.form.to_dict()
	print(form_data)
	if (int(form_data["numGuesses"]) == -1):
		q = "UPDATE leaderboard SET score='{}' WHERE email ='{}'".format(-1, getUser())
		db.query(q)
		return json.dumps({"success":1})

	# calculate score
	now = datetime.now()
	curr_time = now.strftime("%H:%M:%S")

	timeQuery = db.query("SELECT start_time FROM leaderboard WHERE email= '{}'".format(getUser()))
	start_time = timeQuery[0]["start_time"] if timeQuery else timedelta(hours=20)

	logging.warning("timeQuery")
	logging.warning(timeQuery)

	curr = datetime.strptime(curr_time,"%H:%M:%S")
	delta = timedelta(hours=curr.hour, minutes=curr.minute, seconds=curr.second)
	deltaScore = delta - start_time
	deltaScore = deltaScore.total_seconds()

	word =  wordOfDay()
	numGuessesScore = (len(word) / int(form_data["numGuesses"])) * 100

	finalscore = str(int((numGuessesScore / deltaScore) * 100))
	finalscore = finalscore[:7]

	q = "UPDATE leaderboard SET score='{}' WHERE email ='{}'".format(finalscore, getUser())
	db.query(q)

	q = "UPDATE leaderboard SET end_time='{}' WHERE email ='{}'".format(delta, getUser())
	db.query(q)

	return json.dumps({"success":1})

@app.route("/updateFirstTime", methods=["POST"])
def updateFirstTime():
	form_data = request.form.to_dict()
	# update info in table
	q = "UPDATE users SET first_wordle = 'NO' WHERE email ='{}' AND first_wordle = '{}'".format(getUser(), form_data["first-time"])
	db.query(q)

	return json.dumps({"success":1})



@app.route('/processfeedback', methods=["POST"])
def processfeedback():
	# get info from post
	form_data = request.form.to_dict()
	
	if (form_data != {}):
		args = [form_data["name"], form_data["email"], form_data["comment"]]
		db.insertRows("feedback", ["name", "email", "comment"], [args])

	feedback_data = db.query("SELECT * FROM feedback")

	return render_template('feedback.html', feedback_data= feedback_data, user=getUser())

@app.route('/processSignup', methods=["POST"])
def processSignup():
	form_data = dict((key, request.form.getlist(key)[0]) for key in list(request.form.keys()))
	print(form_data)
	if (form_data != {}):
		email, password, confirm = form_data["email"], form_data["password"], form_data["confirmPassword"]

		# check if passswords equal
		if (password != confirm):
			return json.dumps({"success":0})


		# check if email already exists in database
		query = db.query("SELECT email FROM users WHERE email ='{}'".format(email))
		if (query):
			return json.dumps({"success":-1})

		# encrypt and store in database
		args = ["guest", email, db.onewayEncrypt(password), "YES"]
		db.insertRows("users", ["role", "email", "password", "first_wordle"], [args])


	return json.dumps({"success":1})

@app.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    return r

def getRandomWord():
	conn = http.client.HTTPSConnection("random-word-api.herokuapp.com")
	conn.request("GET", "/word")
	res = conn.getresponse()

	if (res.status == 200):
		# success
		data = res.read()
		wordJson = json.loads(data.decode("utf-8"))
		return wordJson[0]

	else:
		# error
		return None

def wordOfDay():
	# get last entry from words table
	w = db.query("SELECT * FROM words ORDER BY word_id DESC LIMIT 1")
	wordDate = w[0]["word_date"] if w else None

	if (wordDate == None):
		newWord = getRandomWord()
		date = datetime.now()
		vals = [newWord, date]
		db.insertRows("words", ["word_of_day", "word_date"], [vals])

		return newWord

	todaysDate = datetime.now().date()

	if (todaysDate > wordDate):
		# need new word for day
		print("fetching new word")
		newWord = getRandomWord()
		date = datetime.now()
		vals = [newWord, date]

		#insert new word into database
		db.insertRows("words", ["word_of_day", "word_date"], [vals])
		
		return newWord
	else:
		# use same word
		print("fetching word from database")
		print(db.query("SELECT * FROM words"))

		return w[0]["word_of_day"]
