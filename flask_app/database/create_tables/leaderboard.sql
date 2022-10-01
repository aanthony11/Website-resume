CREATE TABLE IF NOT EXISTS `leaderboard` (
`leaderboard_id`         int(11)  	    NOT NULL auto_increment	  COMMENT 'the id of this leaderboard',
`email`             	 varchar(100)   NOT NULL                  COMMENT 'the user that played',
`score`        			 int(25)	    DEFAULT NULL              COMMENT 'the score of the game',
`start_time`			 time 	        DEFAULT NULL            		  COMMENT 'the start time of the game',
`end_time`				 time 	        DEFAULT NULL            		  COMMENT 'the end time of the game',
PRIMARY KEY (`leaderboard_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT="Contains wordle game informatino";