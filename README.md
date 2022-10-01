# [Web Application Development](https://gitlab.msu.edu/cse477-spring-2022/course-materials/): Final Exam



## Purpose

The purpose of this Final Exam is to assess your understanding of the essentail elements of web application development covered this semester; these elements include: 

1. Reactive front-end design
2. Design of a data-driven backend
3. Session management
4. Asynchronous communication 
5. Web APIs



## Exam Goals

For the Final Exam, you will develop a twist on the popular word guessing game -  [Wordle](https://www.nytimes.com/games/wordle/index.html). .  Your implementation will be that same as [the standard game](https://www.nytimes.com/games/wordle/index.html), with three exceptions:

1. Users must signup and login before being able to play the game. 
2. The hidden word in your version will not be limited to 5 characters in length. Instead, players will have _n_ tries to guess a word of length _n_.  
3. At the end of a gave, you will display a leaderboard that shows the top 5 users according to how quickly they beat that day's game. 

**NOTE:** Your implementation of the game should be accessible through the project's page of the website you've been building in Homeworks 1-3. 



## Specific Requirements

Your implementation of the  must adhere to the following specific requirements:

1. **The Signup System:** You will develop pages that allow your users to signup with a username and password. Only logged in users should be allowed to play the game. Users must have an ability to logout as well. Make sure that all stored passwords are encrypted.

2. **The Hidden Word**: Your system's backend will source and store a new word for the user's every day. The Hidden word should not be stored anywhere a user could find it (i.e. nowhere on the front-end of your interface). You may use the [word of the day](https://www.merriam-webster.com/word-of-the-day), or some other source of your choosing for this.

3. **The Interface**: On the user's first sign-in, they should be prompted with the instructions for the game. Following this prompt, your users should be presented with an  _n x n_  grid that records their guesses and a visual keyboard that they can use to enter their guesses. Users should be able to use their native keyboard to enter guesses as well.

4. **Input Validation** Before allowing a word to be submitted, you should check that it is a valid English word. You may accomplish this by using the Free Tier of the [Word API](https://www.wordsapi.com/). 

5. **Answer Check**: Following validation, you will check if a user's guess matches the hidden word and color the grid entries based on their status: 

   * grey: if the character does not show up anywhere in the hidden word; 

   * yellow: if user guessed a correct character but in an incorrect location; 

   * green: if the user guessed a correct character in a correct location.

6. **Game Conclusion** If the user guesses the word correctly, or makes _n_ unsuccessful attempts at guessing the word, the game is over and the _n x n_ grid should be replaced by a leaderboard that shows (1) the hidden word, and (2) the top 5 users according to how quickly they beat that day's game. 



## Submitting your assignment

Be sure to perform all development in the `Final-Exam` directory of your <u>Personal Course Repository</u> 



##### Submit Exam Code

1. Submit your assignment by navigating to the main directory of your <u>Personal Course Repository</u> and Pushing your repo to Gitlab; you can do this by running the following commands:

   ```bash
   git add .
   git commit -m 'submitting Final Exam'
   git push
   ```

2. You have now submitted the Final Exam; you can run the same commands to re-submit anytime before the deadline. Please check that your submission was successfully uploaded by navigating to the corresponding directory in Personal Course Repository online.



**Deploy your web application to Google Cloud**

Deploy your Dockerized App to Google Cloud by running the commands below from the Final Exam directory.

```bash
gcloud builds submit --tag gcr.io/cse477-spring-2022/homework
gcloud run deploy --image gcr.io/cse477-spring-2022/homework --platform managed
```

As we did in the homeworks, please retain the <u>Service URL</u>; You can visit the <u>Service URL</u> above to see a live version of your web application. 



##### Submit Final Exam Survey:

[Submit the Service URL for your live web application in this Google Form](https://docs.google.com/forms/d/e/1FAIpQLSfuGboLsfWmHJkQI53wqotfs5BKs05NNgJUwAfX_DEUU0LJLg/viewform). 



## Rubric

This assignment is graded on a 100 point scale; all individual requirements recieve an "all or nothing" grade. The following guide will be used when grading your submission: 



**Specific Requirements:**

* <u> xx/10 points:</u>  The Signup System Requirements were met 

* <u>xx /10 points:</u>  The Hidden Word Requirements were met

* <u>xx/15 points:</u> The Interface requirements were met

* <u>xx/15 points:</u> The Input Validation requirements were met

* <u>xx/20 points:</u> The Answer Check requirements were met

* <u>xx/20 points:</u> The Game Conclusion requirements were met

  

**General Requirements:**

* <u>xx/5</u>: Does the code adhere to Frontend best practices covered throughout the semester?
* <u>xx/5</u>: Does the code adhere to Backend best practices covered throughout the semester?



**Please note that you will receive a 0 on the assignment if any of the following conditions are met:**


* Your containerized application does not compile
* Your application is non-functional
* Your submission was late
* Your work was plagiarized, borrowed, or copied
  * If this condition is met, you will also fail the course.