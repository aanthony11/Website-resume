CREATE TABLE IF NOT EXISTS `words` (
`word_id`         int(11)  	  	 NOT NULL auto_increment	  COMMENT 'the id of this word',
`word_of_day`     varchar(100)   NOT NULL                     COMMENT 'the word of the day',
`word_date`       date 		   	 NOT NULL            		  COMMENT 'the current date',
PRIMARY KEY (`word_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT="Contains word of day information";