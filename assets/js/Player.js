SONG.player = { playlist : [] };

SONG.player.open = function( filename, p ){
	var p = p || {};

	var path = './assets/data/content/' + filename + '.mp3';

	if( p.song ){
		$( '#music-player .info' ).html(
			p.song.artist + ' - ' + p.song.song + ' <span class="year">' + p.song.year + '</span>'
		);
		$( '#music-player .info' ).show();
	}
	else{ $( '#music-player .info' ).hide(); }

	[ 'next', 'prev' ].forEach(function( k ){	
		var key = k + '_song';
		if( p[ key ] ) $( '#music-player .' + k + '-song' ).show();
		else           $( '#music-player .' + k + '-song' ).hide();
	}, this);

	if( p.next_song ) $( '#music-player .loop-song' ).show();
	else              $( '#music-player .loop-song' ).hide();
	$( '#music-player .loop-song' ).removeClass( 'active' );

	$( '#music-player .contents' ).html(
		'<audio controls ' + 
			( p.loop ? 'loop' : '' ) + ' ' + 
			( p.onended ? 'onended="' + p.onended + '"' : '' ) + 
			' autoplay src="' + path + '" />'
	);
	$( '#music-player' ).show();

	this.is_open = true;
};

SONG.player.close = function(){
	if( this.is_open ){
		$( '#music-player .contents' ).html('');
		$( '#music-player' ).hide();

		this.is_open = false;
	}
};

SONG.player.toggle_loop = function(){
	if( this.is_open ){
		var val = !$( '#music-player .contents audio' )[ 0 ].loop;

		$( '#music-player .contents audio' )[ 0 ].loop = val;

		$( '#music-player .loop-song' )[ ( val ? 'add' : 'remove' ) + 'Class' ]( 'active' );
	}
};

SONG.player.set_playlist = function( songs ){
	this.playlist = JL.functions.shuffle_array(
		songs.slice().filter(function( song ){ return song.local; })
	);
};

SONG.player.play_playlist = function(){
	this.playlist = JL.functions.shuffle_array( this.playlist );
	this.playlist_idx = 0;
	this.play_playlist_song();
};

SONG.player.play_playlist_song = function(){
	var song = this.playlist[ this.playlist_idx ];
	this.open( song.local, {
		song,
		no_loop : true,
		onended : 'SONG.player.next_playlist_song();',
		prev_song : function(){ SONG.player.next_playlist_song( -1 ); },
		next_song : function(){ SONG.player.next_playlist_song(  1 ); },
	} );
};

SONG.player.next_playlist_song = function( offset ){
	if( this.is_open ){
		this.playlist_idx += ( offset || 1 );
		while( this.playlist_idx < 0 ) this.playlist_idx += this.playlist.length;
		this.playlist_idx %= this.playlist.length;
		this.play_playlist_song();
	}
};