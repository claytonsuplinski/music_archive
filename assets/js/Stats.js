function home_screen(){

	var buttons = [
		{ label : 'MUSIC OVER TIME'    , onclick : 'graph_stars_per_year();'  , label_sm : 'MUSIC / TIME'   },
		{ label : 'ARTISTS PER YEAR'   , onclick : 'top_artists_per_year();'  , label_sm : 'ARTISTS / YEAR' },
		{ label : 'SONGS PER YEAR'     , onclick : 'top_songs_per_year();'    , label_sm : 'SONGS / YEAR'   },
		{ label : 'TOP ARTISTS'        , onclick : 'top_artists();'           },
		{ label : 'ARTISTS PER DECADE' , onclick : 'top_artists_per_decade();', label_sm : 'ARTIST / 10yrs' },
		{ label : 'SONGS PER DECADE'   , onclick : 'top_songs_per_decade();'  , label_sm : 'SONGS / 10yrs'  },
	];

	$(".header .hidden-sm").html(
		buttons.map( b => '<div class="button" onclick="' + b.onclick + '">' + b.label + '</div>' ).join('')
	);
	$(".header .hidden-lg").html(
		buttons.map( b => '<div class="button button-half-sm" onclick="' + b.onclick + '">' + ( b.label_sm || b.label ) + '</div>' ).join('')
	);
	
	SONG.ALL_YEARS = SONG.ALL_YEARS.sort( (a,b) => ( b.year - a.year ) );
	
	SONG.ALL_DECADES = {};
	
	SONG.ALL_YEARS.forEach(function( year ){
		var decade = Math.floor( year.year / 10 ) * 10;

		if( !SONG.ALL_DECADES[ decade ] ) SONG.ALL_DECADES[ decade ] = [];
		
		SONG.ALL_DECADES[ decade ] = SONG.ALL_DECADES[ decade ].concat( year.songs );
	});

	graph_stars_per_year();
};

function graph_stars_per_year(){
	var id = '#graph';
	
	$("#content").html( '<svg id="graph"></svg>' );

	var container = $(id).parent();

	var is_daily = false;
	
	var container_width = Math.max( container.width(), 300 );

	var margin = {top: 40, right: 20, bottom: 40, left: 80},
	width  = 0.75 *   container_width - margin.left - margin.right,
	height = 0.75 * ( container_width / 3 ) - margin.top - margin.bottom;

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
	return SONG.data.map(function( artist ){
		return {
			artist : artist.artist,
			stars  : artist.songs.map( s => Number( s.stars || 0 ) ).reduce(function(a,b){ return a+b; })
		};
	}).sort(function(a,b){ return b.stars - a.stars; }).slice( 0, num_results || 10 );
};

function average_stars_per_artist( p ){
	var p = p || {};
	
	p.min_songs = p.min_songs || 0;

	return SONG.data.map(function( artist ){
		if( artist.songs.length >= p.min_songs ) return {
			artist : artist.artist,
			stars  : Number( artist.songs.map( s => Number( s.stars || 0 ) ).reduce(function(a,b){ return a+b; }) / (artist.songs.length || 1) ).toFixed( 2 )
		};
	}).sort(function(a,b){ return b.stars - a.stars; }).slice( 0, p.num_results || 10 );
};

function median_stars_per_artist( p ){
	var p = p || {};
	
	p.min_songs = p.min_songs || 0;

	return SONG.data.map(function( artist ){
		var values = artist.songs.map( s => Number( s.stars || 0 ) ).sort( (a,b) => ( a - b ) );
		var middle_index = Math.floor( values.length / 2 );
		
		var median = values[ middle_index ];
		if( !( values.length % 2 ) ) median = ( values[ middle_index - 1 ] + values[ middle_index ] ) / 2;
	
		if( artist.songs.length >= p.min_songs ) return {
			artist : artist.artist,
			stars  : median.toFixed( 1 )
		};
	}).sort(function(a,b){ return b.stars - a.stars; }).slice( 0, p.num_results || 10 );
};

function top_artists(){
	$("#content").html(
		[
			{ label : 'Total Stars'                  , results : total_stars_per_artist() },
			{ label : 'Average Stars - Min 10 Songs' , results : average_stars_per_artist({ min_songs : 10 }) },
			{ label : 'Average Stars - Min 5 Songs'  , results : average_stars_per_artist({ min_songs :  5 }) },
			{ label : 'Median Stars  - Min 5 Songs'  , results : median_stars_per_artist({  min_songs :  5 }) },
		].map(function( category ){
			var prev_score = 999;
			var prev_rank_count = 0;
			var rank = 0;
			
			return '<div class="year-table">' +
				'<table>' +
					'<tr><th colspan="3">' + category.label + '</th></tr>' +
					category.results.map(function( result ){					
						prev_rank_count++;
						
						if( result.stars != prev_score ){
							rank += prev_rank_count;
							prev_rank_count = 0;
							prev_score = result.stars;
						}
					
						return '<tr>' +
							'<td class="rank">' + rank + '</td>' +
							'<td>' + result.artist + '</td>' + 
							'<td class="score">' + result.stars + ' <i class="fa fa-star"></i></td>' + 
						'</tr>';
					}).join('') +
				'</table>' +
			'</div>';
		}).join('<br>')
	);
};

function top_artists_per_decade( p ){
	var p = p || {};
	
	var ordered_decades = [];
	
	Object.keys( SONG.ALL_DECADES ).sort( (a,b) => ( b - a ) ).forEach(function( year ){
		var decade = SONG.ALL_DECADES[ year ];
	
		decade.artists = {};
		
		decade.forEach(function( song ){
			if( !decade.artists[ song.artist ] ) decade.artists[ song.artist ] = 0;
			
			decade.artists[ song.artist ] += song.stars || 0;
		});
		
		var ordered_artists = Object.keys( decade.artists ).map(function( name ){
			return {
				name  : name,
				score : decade.artists[ name ]
			};
		}).sort( ( a, b ) => ( a.score > b.score ? -1 : 1 ) ).slice( 0, p.num_results || 10 );
		
		ordered_decades.push({
			name    : year,
			artists : ordered_artists
		});
	});
	
	$("#content").html(
		ordered_decades.map(function( decade ){
			var prev_score = 999;
			var prev_rank_count = 0;
			var rank = 0;
			
			return '<div class="year-table">' +
				'<table>' +
					'<tr><th colspan="3">' + decade.name + 's</th></tr>' +
					decade.artists.map(function( item, i ){
						prev_rank_count++;
						
						if( item.score != prev_score ){
							rank += prev_rank_count;
							prev_rank_count = 0;
							prev_score = item.score;
						}
						
						return '<tr>' + 
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

function top_artists_per_year( p ){
	var p = p || {};
	
	var years = {};
	var ordered_years = [];
	
	SONG.ALL_YEARS.forEach(function( year ){
		years[ year.year ] = year;
		
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
			name    : year.year,
			artists : ordered_artists
		});
	});
	
	$("#content").html(
		ordered_years.map(function( year ){
			var prev_score = 999;
			var prev_rank_count = 0;
			var rank = 0;
			
			return '<div class="year-table">' +
				'<table>' +
					'<tr><th colspan="3">' + year.name + '</th></tr>' +
					year.artists.map(function( item, i ){
						prev_rank_count++;
						
						if( item.score != prev_score ){
							rank += prev_rank_count;
							prev_rank_count = 0;
							prev_score = item.score;
						}
						
						return '<tr>' + 
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

function top_songs_per_decade( p ){
	var p = p || {};
	
	if( !p.num_results ) p.num_results = 20;
	
	$("#content").html(
		Object.keys( SONG.ALL_DECADES ).sort( (a,b) => ( b - a ) ).map(function( year ){
			var decade = SONG.ALL_DECADES[ year ];
		
			var prev_stars = 999;
			var prev_rank_count = 0;
			var rank = 0;
			
			return '<div class="year-table">' +
				'<table>' +
					'<tr><th colspan="3">' + year + 's</th></tr>' +
					decade.sort( (a,b) => ( ( b.stars || 0 ) - ( a.stars || 0 ) ) ).slice( 0, p.num_results ).map(function( song, i ){
						prev_rank_count++;
						
						if( song.stars != prev_stars ){
							rank += prev_rank_count;
							prev_rank_count = 0;
							prev_stars = song.stars;
						}
						
						return '<tr>' + 
							'<td class="rank">' + rank + '</td>' +
							'<td>' + song.song + ' - ' + song.artist + ' (' + song.year + ')</td>' + 
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

function top_songs_per_year( p ){
	var p = p || {};
	
	var years = [];
	
	SONG.ALL_YEARS.forEach(function( year ){
		years.push({ 
			name  : year.year,
			songs : ( SONG.ALL_YEARS.find( s => s.year == year.year ) || { songs : [] } ).songs.sort(function(a,b){
					var a_stars = a.stars || 0;
					var b_stars = b.stars || 0;
					if( a_stars > b_stars ) return -1;
					if( a_stars < b_stars ) return  1;
					return ( a.song > b.song ? 1 : -1 );
				}).slice( 0, p.num_results || 10 )
		});
	});
	
	$("#content").html(
		years.map(function( year ){
			var prev_stars = 999;
			var prev_rank_count = 0;
			var rank = 0;
			
			return '<div class="year-table">' +
				'<table>' +
					'<tr><th colspan="3">' + year.name + '</th></tr>' +
					year.songs.map(function( song, i ){
						prev_rank_count++;
						
						if( song.stars != prev_stars ){
							rank += prev_rank_count;
							prev_rank_count = 0;
							prev_stars = song.stars;
						}
						
						return '<tr>' + 
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