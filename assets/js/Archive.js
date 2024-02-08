function home_screen(){
	var artists_button = '<div class="button float-right" onclick="all_artists(' + LIMIT.artists + ');">'+
		SONG.data.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' artists' +
	'</div>';
	var songs_button = '<div class="button float-right" onclick="all_songs(' + LIMIT.songs + ');">'+
		SONG.ALL_SONGS.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " songs" +
	'</div>';
	var years_button = '<div class="button float-right" onclick="all_years(' + LIMIT.years + ');">' + 
		SONG.ALL_YEARS.length + 
	' years</div>';

	$(".header").html(
		'<div class="button" onclick="SONG.player.play_playlist();">LOCAL PLAYLIST</div>' +
		'<div class="button" onclick="random_songs(5);">5 RANDOM SONGS</div>'+
		'<div class="button" onclick="random_year();">RANDOM YEAR</div>'+
		artists_button + songs_button + years_button 
	);

	all_artists( LIMIT.artists );
};

function html_song(song){
	var query = encodeURIComponent((song.artist && !song.playlist ? song.artist + " " : '') + song.song);
	var youtube_link = 'https://www.youtube.com/results?search_query='+query;
	var google_link  = 'https://www.google.com/#q='+query;
	var link_8_bit   = 'https://www.youtube.com/results?search_query=8 bit '+query;
	// var repeat_link  = 'http://reppeat.com/results/?search_query='+query;
	return '<div class="song '+(song.playlist ? song.playlist : '')+'">'+
		'<a class="info-link" href="'+google_link+'" target="_blank"><i class="fa fa-info-circle"></i></a> '+
		(song.artist && !song.playlist ? song.artist.toUpperCase() + ' - ' : '') + song.song +
		'<span class="year">(' + song.year + ')</span>' +
		( song.stars ? 
			'<span class="stars ' + ( song.stars >= 6 ? 'six' : '' ) + '">' + 
				Array.apply( null, { length : song.stars } ).map( s => '<i class="fa fa-star"></i>' ).join('') + 
			'</span>' 
			: '' ) +
		'<br>'+
		( song.local ? 
			'<a class="link youtube-link" onclick="SONG.player.open(\'' + song.local + '\', { loop : true});"><i class="fa fa-music"></i></a>' :
			'<a class="link youtube-link" target="_blank" href="'+youtube_link+'"><i class="fa fa-youtube-play"></i></a>'
		) +
		'<a class="link  repeat-link" target="_blank" href="'+link_8_bit+'"><i class="fa fa-th"></i></a>'+
	'</div>';
};

function all_songs( limit ){
	var songs = SONG.ALL_SONGS.slice();
	var curr_sort_type  = SONG.SORT.songs.options[SONG.SORT.songs.curr];
	songs.sort(function(a,b){
		switch(curr_sort_type){
			case 'SONG':
				return (SONG.SORT.songs.asc ? 1 : -1) * ( (a.song_only || a.song).toUpperCase() > (b.song_only || b.song).toUpperCase() ? 1 : -1);
			case 'ARTIST':          
				return (SONG.SORT.songs.asc ? 1 : -1) * ( (a.artist_only || a.artist).toUpperCase() > (b.artist_only || b.artist).toUpperCase() ? 1 : -1);
			case 'YEAR':          
				return (SONG.SORT.songs.asc ? 1 : -1) * (a.year > b.year ? 1 : -1);
			case 'STARS':
				return (SONG.SORT.songs.asc ? 1 : -1) * ( (a.stars || 0) > (b.stars || 0) ? 1 : -1);
		}
	});

	SONG.player.set_playlist( songs );
	
	if( limit ) songs = songs.slice( 0, limit );
	
	var toggle_sort_order = 'SONG.SORT.songs.asc = !SONG.SORT.songs.asc;';
	var toggle_sort_type  = 'SONG.SORT.songs.curr++;'+
		'SONG.SORT.songs.curr %= SONG.SORT.songs.options.length;';
	$("#content").html(
		'<div class="header">'+
			'<div class="button button-2 button-half-sm" onclick="'+toggle_sort_order+'all_songs();">'+
				'<i class="fa fa-sort-amount-asc"></i> '+(SONG.SORT.songs.asc ? 'ASC' : 'DESC')+
			'</div>'+
			'<div class="button button-2 button-half-sm" onclick="'+toggle_sort_type+'all_songs();">'+
				'<i class="fa fa-sort-amount-asc"></i> '+curr_sort_type+
			'</div>'+
		'</div>'+
		songs.map(function(a){ return html_song(a); }).join('') +
		( limit ? '<div class="button button-1" onclick="all_songs();">ALL SONGS</div>' : '' )
	);
};

function all_artists( limit ){
	var artists = SONG.data.slice();
	var curr_sort_type  = SONG.SORT.artists.options[SONG.SORT.artists.curr];
	artists.sort(function(a,b){
		return ( a.artist.toUpperCase() > b.artist.toUpperCase() ? -1 : 1);
	});
	artists.sort(function(a,b){
		switch(curr_sort_type){
			case '# SONGS':
				return (SONG.SORT.artists.asc ? 1 : -1) * (a.songs.length > b.songs.length ? 1 : -1);
			case 'NAME':          
				return (SONG.SORT.artists.asc ? 1 : -1) * (a.artist.toUpperCase() > b.artist.toUpperCase() ? 1 : -1);
		}
	});
	
	if( limit ) artists = artists.slice( 0, limit );
	
	var toggle_sort_order = 'SONG.SORT.artists.asc = !SONG.SORT.artists.asc;';
	var toggle_sort_type  = 'SONG.SORT.artists.curr++;'+
		'SONG.SORT.artists.curr %= SONG.SORT.artists.options.length;';
	$("#content").html('');
	$("#content").html(
		'<div class="header">'+
			'<div class="button button-2 button-half-sm" onclick="'+toggle_sort_order+'all_artists();">'+
				'<i class="fa fa-sort-amount-asc"></i> '+(SONG.SORT.artists.asc ? 'ASC' : 'DESC')+
			'</div>'+
			'<div class="button button-2 button-half-sm" onclick="'+toggle_sort_type+'all_artists();">'+
				'<i class="fa fa-sort-amount-asc"></i> '+curr_sort_type+
			'</div>'+
		'</div>'+
		artists.map(function(a){
			var albums = {};
			a.songs.forEach(function( song ){
				if( song.album ){
					if( !albums[ song.album ] ) albums[ song.album ] = 0;
					albums[ song.album ] += song.stars;
				}
			});
			
			var max_album_stars = 0;
			var max_album_name  = false;
			Object.keys( albums ).forEach(function( name ){
				if( albums[ name ] > max_album_stars ){
					max_album_stars = albums[ name ];
					max_album_name  = name;
				}
			});
			
			var artist_background = false;
			if( a.background ){
				artist_background = './assets/data/backgrounds/' + a.background;
			}
			else if( max_album_name ){
				artist_background = './assets/data/albums/' + text_to_filename( a.artist ) + '_' + 
															  text_to_filename( max_album_name ) + '.jpg';
			}
			
			return '<div class="artist" onclick="load_artist(&quot;'+a.artist+'&quot;);">'+
				'<div class="name">'+
					'<table>'+
						'<tr>'+
							'<td rowspan="6" style="position:relative;">' + 
								( artist_background ? '<div class="artist-background" style="background-image:url(' + artist_background + ');"></div>' : '' ) +
								'<div>' + a.artist.toUpperCase()+'<hr></div>' + 
							'</td>'+
						'</tr>'+
					'</table>'+
				'</div>'+
				'<div class="num-songs">'+
					'<table>'+
						'<tr><td class="number">'+a.songs.length+'</td></tr>'+
						(a.songs.length > 1 ? "SONGS" : "SONG").split('').map(function(b){ return '<tr><td>'+b+'</td></tr>'; }).join('')+
					'</table>'+
				'</div>'+
			'</div>';
		}).join('') +
		( limit ? '<div class="button button-1" onclick="all_artists();">ALL ARTISTS</div>' : '' )
	);
};

function all_years( limit ){
	var years = SONG.ALL_YEARS.slice();
	var curr_sort_type  = SONG.SORT.years.options[SONG.SORT.years.curr];
	years.sort(function(a,b){
		switch(curr_sort_type){
			case '# SONGS':
				return (SONG.SORT.years.asc ? 1 : -1) * (a.songs.length > b.songs.length ? 1 : -1);
			case 'YEAR':
				return (SONG.SORT.years.asc ? 1 : -1) * (a.year > b.year ? 1 : -1);
		}
	});
	
	if( limit ) years = years.slice( 0, limit );
	
	var toggle_sort_order = 'SONG.SORT.years.asc = !SONG.SORT.years.asc;';
	var toggle_sort_type  = 'SONG.SORT.years.curr++;'+
		'SONG.SORT.years.curr %= SONG.SORT.years.options.length;';
	$("#content").html('');
	$("#content").html(
		'<div class="header">'+
			'<div class="button button-2 button-half-sm" onclick="'+toggle_sort_order+'all_years();">'+
				'<i class="fa fa-sort-amount-asc"></i> '+(SONG.SORT.years.asc ? 'ASC' : 'DESC')+
			'</div>'+
			'<div class="button button-2 button-half-sm" onclick="'+toggle_sort_type+'all_years();">'+
				'<i class="fa fa-sort-amount-asc"></i> '+curr_sort_type+
			'</div>'+
		'</div>'+
		years.map(function(a){
			return '<div class="artist" onclick="load_year(&quot;'+a.year+'&quot;);">'+
				'<div class="name">'+
					'<table>'+
						'<tr>'+
							'<td rowspan="6">'+a.year+'<hr></div>'+
						'</tr>'+
					'</table>'+
				'</div>'+
				'<div class="num-songs">'+
					'<table>'+
						'<tr><td class="number">'+a.songs.length+'</td></tr>'+
						(a.songs.length > 1 ? "SONGS" : "SONG").split('').map(function(b){ return '<tr><td>'+b+'</td></tr>'; }).join('')+
					'</table>'+
				'</div>'+
			'</div>';
		}).join('') +
		( limit ? '<div class="button button-1" onclick="all_years();">ALL YEARS</div>' : '' )
	);
};

function load_artist(artist){
	$("#content").html('');
	var matches = SONG.data.filter(function(a){ return a.artist.toLowerCase() == artist.toLowerCase(); });
	if(matches.length){
		var songs = matches[0].songs.map(function(a){ 
			a.artist = matches[0].artist;
			a.playlist = matches[0].playlist;
			return a
		});
		draw_songs( songs );
	}
};

function random_artist(){
	load_artist(SONG.data[Math.floor(Math.random()*SONG.data.length)].artist);
};

function random_index( arr ){
	return Math.floor( Math.random() * arr.length );
};

function random_songs(num){
	var results      = [];
	var used_indices = [];
	
	while( used_indices.length < num ){
		var index = random_index( SONG.ALL_SONGS );
		if( used_indices.indexOf( index ) == -1 ){
			results.push( SONG.ALL_SONGS[ index ] );
			used_indices.push( index );
		}
	};
	
	draw_songs( results );
};

function load_year(year){
	$("#content").html('');
	var matches = SONG.ALL_SONGS.filter(function(a){ return year == a.year; });
	if( matches.length ) draw_songs( matches );
};

function draw_songs( songs ){
	SONG.player.set_playlist( songs );
	$( "#content" ).html(
		songs.map(function( s ){ return html_song(s); }).join('')
	);
};

function random_year(){
	load_year(SONG.ALL_YEARS[Math.floor(Math.random()*SONG.ALL_YEARS.length)].year);
};

function open_link( idx ){
	try{
		window.open( $( ".song a.youtube-link" )[ idx ], '_blank' ).focus();
	} catch(e){}
};

load_data( home_screen );