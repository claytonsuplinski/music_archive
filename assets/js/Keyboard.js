SONG.keyboard = new JL.keyboard(
	[
		{ name :        '1', down : function(){ open_link( 0 );    } },
		{ name :        '2', down : function(){ open_link( 1 );    } },
		{ name :        '3', down : function(){ open_link( 2 );    } },
		{ name :        '4', down : function(){ open_link( 3 );    } },
		{ name :        '5', down : function(){ open_link( 4 );    } },
		{ name : 'NUMPAD 1', down : function(){ open_link( 0 );    } },
		{ name : 'NUMPAD 2', down : function(){ open_link( 1 );    } },
		{ name : 'NUMPAD 3', down : function(){ open_link( 2 );    } },
		{ name : 'NUMPAD 4', down : function(){ open_link( 3 );    } },
		{ name : 'NUMPAD 5', down : function(){ open_link( 4 );    } },
		{ name :        'R', down : function(){ random_songs( 5 ); } },
		{ name :        'Y', down : function(){ random_year();     } },
	]
);