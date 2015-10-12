<?php
header( 'Access-Control-Allow-Origin: *' );
header( 'Content-Type: text/html; charset=utf-8' );

$org = 'http://###.###.###.###:8888/'; // http://IP:PORT/

function replace_url( $str )
{
	global $org;

	$str = str_replace( '[[ url ]]', $org, $str );
	return ( $str );
}

ob_start( 'replace_url' );
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Sonneries</title>
		<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
		<meta property="og:url" content="http://<?= $_SERVER[ 'SERVER_NAME' ] ?>/" />
		<meta property="og:type" content="website" />
		<meta property="og:title" content="Sonneries" />
		<meta property="og:description" content="Téléchargez toute sorte de sonnerie pour votre smartphone ..." />
		<meta property="og:image" content="[[ url ]]img/icon.png" />
		<link rel="icon" type="image/png" href="[[ url ]]img/favicon.png" sizes="64x64" />
		<style type="text/css">
			#site, #error {
				position: fixed;
				top: 0;
				bottom: 0;
				left: 0;
				right: 0;
				width: 100%;
				height: 100%;
				border: 0;
			}
			#error {
				display: none;
				position: relative;
				width: 100%;
				height: 100%;
				text-align: center;
				font-family: sans-serif;
			}
			#error > div {
				position: absolute;
				top: 50%;
				left: 50%;
				width: 90%;
				max-width: 90%;
				max-height: 90%;
				transform: translate( -50%,-50% );
			}
			#error > div > img {
				max-width: 90%;
				max-height: 90%;
			}
		</style>
		<script type="text/javascript">
			var loaded = false;
			function checkIframeLoaded()
			{
				if ( !loaded )
				{
					document.getElementById( 'site' ).style.display = 'none';
					document.getElementById( 'error' ).style.display = 'block';
				}
			}

			window.setTimeout( checkIframeLoaded, 1500 );
			window.addEventListener( 'message', function ( event )
			{
				if ( event.data == 'ping' );
					loaded = true;
			}, false );
		</script>
	</head>

	<body>
		<iframe id="site" src="<?= $org ?>"></iframe>
		<div id="error">
			<div>
				<img src="angular-js.png" />
				<br />Le serveur n'étant pas démarré pour le moment, le site est inaccessible ...
				<br />Veuillez renouveller votre requête ultérieurement.
			</div>
		</div>
	</body>
</html>
<?php ob_end_flush(); ?>
