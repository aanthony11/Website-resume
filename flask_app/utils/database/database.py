import mysql.connector
import glob
import json
import csv
from io import StringIO
import itertools
import hashlib
import os
import cryptography
from cryptography.fernet import Fernet
from math import pow

class database:
    table_vals = {
        "institutions": "(%s, %s, %s, %s, %s, %s, %s)",
        "positions": "(%s, %s, %s, %s, %s)",
        "experiences": "(%s, %s, %s, %s, %s, %s)",
        "skills" : "(%s, %s, %s)",
        "feedback": "(%s, %s, %s)",
        "users": "(%s, %s, %s, %s)",
        "words": "(%s, %s)",
        "leaderboard": "(%s, %s)",
    }

    def __init__(self, purge = False):

        # Grab information from the configuration file
        self.database       = 'db'
        self.host           = '127.0.0.1'
        self.user           = 'master'
        self.port           = 3306
        self.password       = 'master'
        self.tables         = ['institutions', 'positions', 'experiences', 'skills','feedback', 'users']
        
        # NEW IN HW 3-----------------------------------------------------------------
        self.encryption     =  {   'oneway': {'salt' : b'averysaltysailortookalongwalkoffashortbridge',
                                                 'n' : int(pow(2,5)),
                                                 'r' : 9,
                                                 'p' : 1
                                             },
                                'reversible': { 'key' : '7pK_fnSKIjZKuv_Gwc--sZEMKn2zc8VvD6zS96XcNHE='}
                                }
        #-----------------------------------------------------------------------------

    def query(self, query = "SELECT * FROM users", parameters = None):

        cnx = mysql.connector.connect(host     = self.host,
                                      user     = self.user,
                                      password = self.password,
                                      port     = self.port,
                                      database = self.database,
                                      charset  = 'latin1'
                                     )


        if parameters is not None:
            cur = cnx.cursor(dictionary=True)
            cur.execute(query, parameters)
        else:
            cur = cnx.cursor(dictionary=True)
            cur.execute(query)

        # Fetch one result
        row = cur.fetchall()
        cnx.commit()

        if "INSERT" in query:
            cur.execute("SELECT LAST_INSERT_ID()")
            row = cur.fetchall()
            cnx.commit()
        cur.close()
        cnx.close()
        return row

    def createTables(self, purge=False, data_path = 'flask_app/database/'):
        cnx = mysql.connector.connect(host     = self.host,
                              user     = self.user,
                              password = self.password,
                              port     = self.port,
                              database = self.database,
                              charset  = 'latin1'
                             )

        """
        Create Institutions table
        """
        inst_file = open("flask_app/database/create_tables/" + "institutions.sql")
        inst_str = inst_file.read()
        cur = cnx.cursor(dictionary=True)
        cur.execute(inst_str)
        inst_file.close()

        init_vals = []

        with open("flask_app/database/initial_data/institutions.csv", newline='') as csvfile:
            insert = "INSERT IGNORE INTO institutions (inst_id, type, name, department, address, city, state, zip) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"

            reader = csv.reader(csvfile)
            for row in reader:
                tp = tuple(row)
                init_vals.append(tp)
            cur.executemany(insert, init_vals)
            cnx.commit()
            print(cur.rowcount, " institution record(s) inserted")

        """
        Create Positions table
        """
        post_file = open("flask_app/database/create_tables/" + "positions.sql")
        post_str = post_file.read()
        cur = cnx.cursor(dictionary=True)
        cur.execute(post_str)
        post_file.close()

        init_vals.clear()
        with open("flask_app/database/initial_data/positions.csv", newline='') as csvfile:
            insert = "INSERT IGNORE INTO positions (position_id, inst_id, title, responsibilities, start_date) VALUES (%s, %s, %s, %s, %s)"
            insertEndDate = "INSERT IGNORE INTO positions (position_id, inst_id, title, responsibilities, start_date, end_date) VALUES (%s, %s, %s, %s, %s, %s)"

            reader = csv.reader(csvfile)
            first = True
            for row in reader:
                if first:
                    tp = tuple(row)
                    cur.execute(insert, tp)
                    first = False
                else:
                    tp = tuple(row)
                    init_vals.append(tp)
            cur.executemany(insertEndDate, init_vals)
            cnx.commit()
            print(cur.rowcount, " position record(s) inserted")


        """
        Create Experiences table
        """
        exp_file = open("flask_app/database/create_tables/" + "experiences.sql")
        exp_str = exp_file.read()
        cur = cnx.cursor(dictionary=True)
        cur.execute(exp_str)
        exp_file.close()

        init_vals.clear()
        with open("flask_app/database/initial_data/experiences.csv", newline='') as csvfile:
            insert = "INSERT IGNORE INTO experiences (experience_id, position_id, name, description, hyperlink, start_date) VALUES (%s, %s, %s, %s, %s, %s)"
            insertEndDate = "INSERT IGNORE INTO experiences (experience_id, position_id, name, description, hyperlink, start_date, end_date) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            
            reader = csv.reader(csvfile)
            first = True
            for row in reader:
                if first:
                    tp = tuple(row)
                    cur.execute(insert, tp)
                    first = False
                else:
                    tp = tuple(row)
                    init_vals.append(tp)
            cur.executemany(insertEndDate, init_vals)
            cnx.commit()
            print(cur.rowcount, " experience record(s) inserted")


        """
        Create Skills table
        """
        skill_file = open("flask_app/database/create_tables/" + "skills.sql")
        skill_str = skill_file.read()
        cur = cnx.cursor(dictionary=True)
        cur.execute(skill_str)
        skill_file.close()

        init_vals.clear()
        with open("flask_app/database/initial_data/skills.csv", newline='') as csvfile:
            insert = "INSERT IGNORE INTO skills (skill_id, experience_id, name, skill_level) VALUES (%s, %s, %s, %s)"

            reader = csv.reader(csvfile)
            for row in reader:
                tp = tuple(row)
                init_vals.append(tp)
            cur.executemany(insert, init_vals)
            cnx.commit()
            print(cur.rowcount, " skill record(s) inserted")

        """
        Create Feedback table
        """
        feedback_file = open("flask_app/database/create_tables/" + "feedback.sql")
        feedback_str = feedback_file.read()
        cur = cnx.cursor(dictionary=True)
        cur.execute(feedback_str)
        feedback_file.close()

        """
        Create Users table
        """
        users_file = open("flask_app/database/create_tables/" + "users.sql")
        users_str = users_file.read()
        cur = cnx.cursor(dictionary=True)
        cur.execute(users_str)
        users_file.close()

        """
        Create Wordle table
        """
        wordle_file = open("flask_app/database/create_tables/" + "wordle.sql")
        wordle_str = wordle_file.read()
        cur = cnx.cursor(dictionary=True)
        cur.execute(wordle_str)
        wordle_file.close()

        """
        Create Leaderboard table
        """
        leaders_file = open("flask_app/database/create_tables/" + "leaderboard.sql")
        leaders_str = leaders_file.read()
        cur = cnx.cursor(dictionary=True)
        cur.execute(leaders_str)
        leaders_file.close()

        """
        Create Words table
        """
        words_file = open("flask_app/database/create_tables/" + "words.sql")
        words_str = words_file.read()
        cur = cnx.cursor(dictionary=True)
        cur.execute(words_str)
        words_file.close()

    def insertRows(self, table='table', columns=['x','y'], parameters=[['v11','v12'],['v21','v22']]):
        
        cnx = mysql.connector.connect(host     = self.host,
                                      user     = self.user,
                                      password = self.password,
                                      port     = self.port,
                                      database = self.database,
                                      charset  = 'latin1'
                                     )
        cur = cnx.cursor(dictionary=True)

        column_str = ", ".join(columns)
        insert = "INSERT INTO {0} ({1}) VALUES {2}".format(table, column_str, self.table_vals[table])
        print(insert)
        # insert parameters into table
        for i in range(len(parameters)):
            tp = tuple(parameters[i])
            cur.execute(insert, tp)

        cnx.commit()

#######################################################################################
# AUTHENTICATION RELATED
#######################################################################################
    def createUser(self, email='me@email.com', password='password', role='user'):
        users_query = self.query()

        # check if email exists
        for user in users_query:
            if (user["email"] == email):
                # user already exists
                return {'success': 0}
            else:
                continue


        # user email does not exist in databasee
        args = [role, email, self.onewayEncrypt(password), "YES"]
        self.insertRows("users", ["role", "email", "password", "first_wordle"], [args])

        return {'success': 1}

    def authenticate(self, email='me@email.com', password='password'):
        # check if email and encrypted password exists in database
        users_query = self.query()

        # check if email exists
        for user in users_query:
            if (user["email"] == email):
                if (user["password"] == self.onewayEncrypt(password)):
                    # authenticate user
                    return {'success': 1}
            else:
                continue

        return {'success': 0}

    def onewayEncrypt(self, string):
        encrypted_string = hashlib.scrypt(string.encode('utf-8'),
                                          salt = self.encryption['oneway']['salt'],
                                          n    = self.encryption['oneway']['n'],
                                          r    = self.encryption['oneway']['r'],
                                          p    = self.encryption['oneway']['p']
                                          ).hex()
        return encrypted_string


    def reversibleEncrypt(self, type, message):
        fernet = Fernet(self.encryption['reversible']['key'])
        
        if type == 'encrypt':
            message = fernet.encrypt(message.encode())
        elif type == 'decrypt':
            message = fernet.decrypt(message).decode()

        return message


