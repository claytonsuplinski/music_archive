SONG.STARTING_YEAR = 1993;
SONG.ENDING_YEAR = ( new Date() ).getFullYear();

function home_screen(){

	var buttons = [
		{ label : 'MUSIC OVER TIME'     , onclick : 'graph_stars_per_year();' , label_sm : 'MUSIC / TIME'   },
		{ label : 'ARTISTS OVER TIME'   , onclick : 'graph_stars_per_year();' , label_sm : 'ARTISTS / TIME' },
		{ label : 'ARTIST OVER TIME'    , onclick : 'graph_stars_per_year();' , label_sm : 'ARTIST / TIME'  },
		{ label : 'TOP SONGS PER YEAR'  , onclick : 'top_songs_per_year();'   , label_sm : 'SONGS / YEAR'   },
		{ label : 'TOP ARTISTS PER YEAR', onclick : 'top_artists_per_year();' , label_sm : 'ARTISTS / YEAR' },
		{ label : 'TOP ARTISTS'         , onclick : 'top_artists();'          },
	];

	$(".header .hidden-sm").html(
		buttons.map( b => '<div class="button" onclick="' + b.onclick + '">' + b.label + '</div>' ).join('')
	);
	$(".header .hidden-lg").html(
		buttons.map( b => '<div class="button button-half-sm" onclick="' + b.onclick + '">' + ( b.label_sm || b.label ) + '</div>' ).join('')
	);

	graph_stars_per_year();
};

function graph_stars_per_year(){
	var id = '#graph';
	
	$("#content").html( '<svg id="graph"></svg>' );

	var container = $(id).parent();

	var is_daily = false;

	var margin = {top: 40, right: 20, bottom: 40, left: 80},
	width  = 0.75 * container.width() - margin.left - margin.right,
	height = 0.75 * ( container.width() / 3 ) - margin.top - margin.bottom;

	var parse_date = d3.time.format( "%Y" ).parse;

	var x = d3.time.scale().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);

	var x_axis = d3.svg.axis().scale(x).orient("bottom").ticks(5);
	var y_axis = d3.svg.axis().scale(y).orient("left").ticks(5);

	// Define the line
	var lines = d3.svg.line()
		.x(function(d) { return x(d.date); })
		.y(function(d) { return y(d.value); });

	// Adds the svg canvas
	var svg = d3.select( id )
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", 
			"translate(" + margin.left + "," + margin.top + ")");
			
			
	var years = [];
	
	SONG.data.forEach(function(artist){
		if(artist.songs){
			artist.songs.forEach(function(song){
				if(song.year && song.stars && song.year >= 1900){
					var year = years.find( y => y.name == song.year );
					if(!year){
						year = { name : song.year, value : 0 };
						years.push( year );
					}
					
					year.value += song.stars;
				}
			});
		}
	});
	
	years = years.sort( (a,b) => ( a.name - b.name ) );
	
	var min_year = years[0];
	var max_year = years[ years.length - 1 ];
	
	var years_final = [];
	for(var yr = Number(min_year.name); yr <= Number(max_year.name); yr++){
		years_final.push( years.find( year => year.name == yr ) || { name : String(yr), value : 0 } );
	}
	
	years = years_final;
	
	$("#content").append(
		'<div class="graph-values">' +
			'<div class="header">VALUES<hr></div>' +
			years.slice().sort( (a,b) => b.value - a.value ).map(function(year){
				return '<div class="value">' + 
					'<div class="lbl">' + year.name  + '</div>' +
					'<div class="val">' + year.value + '</div>' +
				'</div>';
			}).join('')+
		'</div>'
	);

	x.domain([ parse_date( min_year.name ), parse_date( max_year.name ) ]);
	y.domain([0, d3.max(years, function(d) { return d.value; })]);

	var data = [];
	years.forEach(function(year){
		data.push({ date : parse_date( year.name ), value : year.value });
	});

	// Plot the lines.
	svg.append("path")
		.attr("class", "line")
		.attr("d", lines(data));

	// Add the X Axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(x_axis);

	// Add the Y Axis
	svg.append("g")
		.attr("class", "y axis")
		.call(y_axis);
};

function total_stars_per_artist( num_results ){
	SONG.data.map(function( artist ){
		return {
			artist : artist.artist,
			stars  : artist.songs.map( s => Number( s.stars || 0 ) ).reduce(function(a,b){ return a+b; })
		};
	}).sort(function(a,b){ return b.stars - a.stars; }).slice( 0, num_results || 10 ).forEach(function(a){ console.log( a.artist, a.stars ); });
};

function average_stars_per_artist( p ){
	var p = p || {};
	
	p.min_songs = p.min_songs || 0;

	SONG.data.map(function( artist ){
		if( artist.songs.length >= p.min_songs ) return {
			artist : artist.artist,
			stars  : artist.songs.map( s => Number( s.stars || 0 ) ).reduce(function(a,b){ return a+b; }) / (artist.songs.length || 1)
		};
	}).sort(function(a,b){ return b.stars - a.stars; }).slice( 0, p.num_results || 10 ).forEach(function(a){ console.log( a.artist, a.stars ); });
};

function top_artists(){
	console.log( total_stars_per_artist() );
	console.log( average_stars_per_artist() );
	$("#content").html(
		[
			'Total Stars',
			'Average Stars (min 10 songs)',
			'Average Stars (min 5 songs)',
			'Median Stars (min 5 songs)',
		].join('<br>')
	);
};

function top_artists_per_year( p ){
	var p = p || {};
	
	var years = {};
	var ordered_years = [];
	
	SONG.ALL_YEARS.forEach(function( y ){ years[ y.year ] = y; });

	for( var YYYY = SONG.ENDING_YEAR; YYYY >= SONG.STARTING_YEAR; YYYY-- ){
		var year = years[ YYYY ];
		
		var artists = {};
		
		year.songs.forEach(function( song ){
			if( !artists[ song.artist ] ) artists[ song.artist ] = 0;
			
			artists[ song.artist ] += song.stars || 0;
		});
		
		var ordered_artists = Object.keys( artists ).map(function( name ){
			return {
				name  : name,
				score : artists[ name ]
			};
		}).sort( ( a, b ) => ( a.score > b.score ? -1 : 1 ) ).slice( 0, p.num_results || 10 );
		
		ordered_years.push({
			name    : YYYY,
			artists : ordered_artists
		});
	}
	
	$("#content").html(
		ordered_years.map(function( year ){
			var prev_score = 999;
			var prev_rank_count = 0;
			var rank = 0;
			
			return '<div class="year-table">' +
				'<table>' +
					year.artists.map(function( item, i ){
						prev_rank_count++;
						
						if( item.score != prev_score ){
							rank += prev_rank_count;
							prev_rank_count = 0;
							prev_score = item.score;
						}
						
						return '<tr>' + 
							( i == 0 ? '<th rowspan="' + year.artists.length + '">' + year.name + '</th>' : '' ) +
							'<td class="rank">' + rank + '</td>' +
							'<td>' + item.name + '</td>' + 
							'<td class="score">' + item.score + ' <i class="fa fa-star"></i></td>' + 
						'</tr>';
					}).join('') +
				'</table>' +
			'</div>';
		}).join('')
	);
};

function top_songs_per_year( p ){
	var p = p || {};
	
	var years = [];
	
	for( var year = SONG.ENDING_YEAR; year >= SONG.STARTING_YEAR; year-- ){
		years.push({ 
			name  : year,
			songs : ( SONG.ALL_YEARS.find( s => s.year == year ) || { songs : [] } ).songs.sort(function(a,b){
					var a_stars = a.stars || 0;
					var b_stars = b.stars || 0;
					if( a_stars > b_stars ) return -1;
					if( a_stars < b_stars ) return  1;
					return ( a.song > b.song ? 1 : -1 );
				}).slice( 0, p.num_results || 10 )
		});
	}
	
	$("#content").html(
		years.map(function( year ){
			var prev_stars = 999;
			var prev_rank_count = 0;
			var rank = 0;
			
			return '<div class="year-table">' +
				'<table>' +
					year.songs.map(function( song, i ){
						prev_rank_count++;
						
						if( song.stars != prev_stars ){
							rank += prev_rank_count;
							prev_rank_count = 0;
							prev_stars = song.stars;
						}
						
						return '<tr>' + 
							( i == 0 ? '<th rowspan="' + year.songs.length + '">' + year.name + '</th>' : '' ) +
							'<td class="rank">' + rank + '</td>' +
							'<td>' + song.song + ' - ' + song.artist + '</td>' + 
							'<td class="score ' + ( song.stars == 6 ? 'six-stars' : '' ) + '">' + 
								Array.apply( null, { length : song.stars } ).map( s => '<i class="fa fa-star"></i>' ).join('') + 
							'</td>' + 
						'</tr>';
					}).join('') +
				'</table>' +
			'</div>';
		}).join('')
	);
};

load_data( home_screen );

/*
-- Stats to Collect --
Top 10 artists of all time -- based on total number of stars or average number of stars (may need a minimum number of songs to make the list)
Top 10 artists per year    -- based on total number of stars that year
Top 10 songs per year      -- based on number of stars of the individual song
*/